import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "out");
const manifestPath = path.join(rootDir, ".pages-export-manifest.json");

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(dir, prefix = "") {
  const entries = await readdir(dir, {
    withFileTypes: true,
  });

  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(prefix, entry.name);
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath, relativePath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

async function readPreviousManifest() {
  if (!(await pathExists(manifestPath))) return [];

  try {
    const raw = await readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.files) ? parsed.files : [];
  } catch {
    return [];
  }
}

async function pruneEmptyDirectories(startDir) {
  let currentDir = startDir;

  while (currentDir.startsWith(rootDir) && currentDir !== rootDir) {
    const entries = await readdir(currentDir);
    if (entries.length > 0) return;

    await rm(currentDir, { recursive: false, force: true });
    currentDir = path.dirname(currentDir);
  }
}

async function removeStaleFiles(previousFiles, nextFiles) {
  const nextSet = new Set(nextFiles);

  for (const relativePath of previousFiles) {
    if (nextSet.has(relativePath)) continue;

    const targetPath = path.join(rootDir, relativePath);
    await rm(targetPath, { force: true });
    await pruneEmptyDirectories(path.dirname(targetPath));
  }
}

async function copyExportFiles(files) {
  for (const relativePath of files) {
    const sourcePath = path.join(outDir, relativePath);
    const targetPath = path.join(rootDir, relativePath);

    await mkdir(path.dirname(targetPath), { recursive: true });
    await cp(sourcePath, targetPath, { force: true });
  }
}

if (!(await pathExists(outDir))) {
  throw new Error("Missing out/ directory. Run `next build` before syncing export.");
}

const nextFiles = (await collectFiles(outDir)).sort();
const previousFiles = await readPreviousManifest();

await removeStaleFiles(previousFiles, nextFiles);
await copyExportFiles(nextFiles);

await writeFile(
  manifestPath,
  `${JSON.stringify({ files: nextFiles }, null, 2)}\n`,
  "utf8"
);
