// Shared publication helpers.
//
// Used by both the OpenAlex sync script (scripts/fetch-publications.mjs) and
// the app (src/lib/publications.ts) so that dedup / lab-member matching rules
// stay identical between the crawler and what is rendered.

/**
 * @typedef {Object} PublicationLike
 * @property {string} id
 * @property {string} title
 * @property {number} year
 * @property {string | null} venue
 * @property {string[]} authors
 * @property {string | null} doi
 * @property {string} url
 * @property {boolean} openAccess
 * @property {string} type
 * @property {string[]} [areas]
 * @property {string | null} [pdf]
 * @property {string | null} [teaserImage]
 * @property {string | null} [teaserAlt]
 * @property {string | null} [award]
 */

const PI_NAME_KEYS = new Set(["bongwonsuh", "suhbongwon"]);

// Sources that host preprints / datasets / talk recordings rather than the
// published paper. OpenAlex often returns these as separate works with the
// same title as the published version.
const NON_PUBLISHED_SOURCE =
  /arxiv|ssrn|figshare|indigo|underline|zenodo|biorxiv|medrxiv|research square|osf\b|preprint/i;
const NON_PAPER_TYPE = /dataset|audiovisual|paratext|erratum|editorial|^other$/i;
const PREPRINT_TYPE = /preprint|posted.content|^text$/i;

/**
 * Normalize a person name for fuzzy comparison: lowercase, strip diacritics,
 * drop everything that is not a letter. "Kyu‐Sik Kim" -> "kyusikkim".
 * @param {string | null | undefined} name
 */
export function normalizeName(name) {
  return (name ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/**
 * Name keys in both "first last" and "last first" order so that
 * "Suh, Bongwon" and "Bongwon Suh" collapse to the same set.
 * @param {string | null | undefined} name
 * @returns {string[]}
 */
export function nameKeys(name) {
  const raw = (name ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const parts = raw.split(/[\s,]+/).filter(Boolean);
  const joined = parts.join("").replace(/[^a-z]/g, "");
  const reversed = [...parts].reverse().join("").replace(/[^a-z]/g, "");
  return joined ? [...new Set([joined, reversed])] : [];
}

/** @param {string | null | undefined} name */
export function isBongwonSuh(name) {
  return nameKeys(name).some((key) => PI_NAME_KEYS.has(key));
}

/**
 * Title key used to detect the same paper appearing under multiple OpenAlex
 * records (preprint + proceedings, talk recording + paper, ...).
 * @param {string | null | undefined} title
 */
export function titleKey(title) {
  return (title ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/**
 * 2 = published paper, 1 = preprint / unknown venue, 0 = dataset, talk video, ...
 * @param {Pick<PublicationLike, "venue" | "type">} pub
 */
export function publicationRank(pub) {
  const type = pub.type ?? "";
  const venue = pub.venue ?? "";
  if (NON_PAPER_TYPE.test(type)) return 0;
  if (!venue) return 1;
  if (NON_PUBLISHED_SOURCE.test(venue)) return 1;
  if (PREPRINT_TYPE.test(type)) return 1;
  return 2;
}

/**
 * Pick the record that should represent a group of same-title publications.
 * Higher rank wins, then having a DOI, then the newer year, then input order.
 * @template {PublicationLike} T
 * @param {T[]} group
 */
export function pickPreferredPublication(group) {
  return group.reduce((best, pub) => {
    const rankDiff = publicationRank(pub) - publicationRank(best);
    if (rankDiff !== 0) return rankDiff > 0 ? pub : best;
    const doiDiff = Number(Boolean(pub.doi)) - Number(Boolean(best.doi));
    if (doiDiff !== 0) return doiDiff > 0 ? pub : best;
    if (pub.year !== best.year) return pub.year > best.year ? pub : best;
    return best;
  });
}

/**
 * Collapse same-title records into one entry for display. The preferred record
 * is kept and manual fields (areas / pdf / teaserImage / teaserAlt / award) are merged
 * in from its siblings so that curated metadata is never lost by the collapse.
 * The original order of the surviving entries is preserved.
 * @template {PublicationLike} T
 * @param {T[]} publications
 * @returns {T[]}
 */
export function collapsePublications(publications) {
  /** @type {Map<string, T[]>} */
  const groups = new Map();
  for (const pub of publications) {
    const key = titleKey(pub.title) || pub.id;
    const group = groups.get(key);
    if (group) group.push(pub);
    else groups.set(key, [pub]);
  }

  /** @type {Map<T, T>} */
  const replacement = new Map();
  /** @type {Set<T>} */
  const dropped = new Set();
  for (const group of groups.values()) {
    if (group.length === 1) continue;
    const preferred = pickPreferredPublication(group);
    const areas = [...new Set(group.flatMap((pub) => pub.areas ?? []))];
    const pickManual = (/** @type {"pdf" | "teaserImage" | "teaserAlt" | "award"} */ field) =>
      preferred[field] ?? group.map((pub) => pub[field]).find(Boolean) ?? null;

    const merged = {
      ...preferred,
      ...(areas.length ? { areas } : {}),
      ...(pickManual("pdf") ? { pdf: pickManual("pdf") } : {}),
      ...(pickManual("teaserImage") ? { teaserImage: pickManual("teaserImage") } : {}),
      ...(pickManual("teaserAlt") ? { teaserAlt: pickManual("teaserAlt") } : {}),
      ...(pickManual("award") ? { award: pickManual("award") } : {}),
    };
    replacement.set(preferred, merged);
    for (const pub of group) if (pub !== preferred) dropped.add(pub);
  }

  return publications.flatMap((pub) => {
    if (dropped.has(pub)) return [];
    return [replacement.get(pub) ?? pub];
  });
}

/**
 * Build a matcher that tells whether an author name belongs to a lab member
 * (current or alumni) listed in members.json.
 * @param {{ current?: { name: string }[], alumni?: { name: string }[] }} members
 * @returns {(authorName: string) => boolean}
 */
export function buildLabAuthorMatcher(members) {
  const keys = new Set();
  for (const person of [...(members.current ?? []), ...(members.alumni ?? [])]) {
    for (const key of nameKeys(person.name)) keys.add(key);
  }
  return (authorName) => nameKeys(authorName).some((key) => keys.has(key));
}

/**
 * A publication counts as a lab paper when, besides the PI, at least one
 * author is a lab member. Collaborations where the PI is the only lab author
 * (e.g. clinical studies) are left for manual curation.
 * @param {Pick<PublicationLike, "authors">} pub
 * @param {(authorName: string) => boolean} isLabAuthor
 */
export function isLabPublication(pub, isLabAuthor) {
  return pub.authors.some((author) => !isBongwonSuh(author) && isLabAuthor(author));
}

/**
 * File-name slug for a publication: "2026-mine-over-yours-how-authorship-biases".
 * @param {Pick<PublicationLike, "title" | "year">} pub
 */
export function publicationSlug(pub) {
  const words = (pub.title ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 7)
    .join("-");
  return `${pub.year}-${words || "paper"}`;
}
