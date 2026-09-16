import publicationsData from "@/data/publications.json";
import { collapsePublications } from "@/lib/publications.mjs";

export type Publication = {
  id: string;
  title: string;
  year: number;
  venue: string | null;
  authors: string[];
  doi: string | null;
  pdf?: string | null;
  teaserImage?: string | null;
  teaserAlt?: string | null;
  award?: string | null;
  url: string;
  openAccess: boolean;
  type: string;
  areas?: string[];
};

// publications.json is append-only, so the same paper can be stored several
// times (arXiv preprint + proceedings, talk recording + paper). Collapse those
// for display while keeping curated fields from every copy.
export const publications: Publication[] = collapsePublications(
  publicationsData.publications as Publication[]
);
