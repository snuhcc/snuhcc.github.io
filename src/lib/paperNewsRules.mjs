// Venue → news rules shared by the sync script (which generates
// "Congrats! N papers accepted at X" items) and src/lib/news.ts (which links
// the matching publications to each news item).
//
// Within a rule, buckets are tested in order and the first match wins, so the
// more specific pattern (companion / adjunct / extended abstracts) must come
// before the generic one.

/**
 * @typedef {"paper" | "findings" | "poster"} NewsBucket
 * @typedef {{ pattern: RegExp, bucket: NewsBucket }} NewsBucketMatcher
 * @typedef {{ key: string, label: (year: number) => string, buckets: NewsBucketMatcher[] }} PaperNewsRule
 */

/** @type {PaperNewsRule[]} */
export const PAPER_NEWS_RULES = [
  {
    key: "acl",
    label: (year) => `ACL ${year}`,
    buckets: [
      {
        pattern: /^Findings of the Association for Computational Linguistics: ACL /i,
        bucket: "findings",
      },
      {
        pattern:
          /^Proceedings of the \d+(st|nd|rd|th) Annual Meeting of the Association for Computational Linguistics/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "emnlp",
    label: (year) => `EMNLP ${year}`,
    buckets: [
      {
        pattern: /^Findings of the Association for Computational Linguistics: EMNLP /i,
        bucket: "findings",
      },
      {
        pattern:
          /^Proceedings of the (\d{4} )?Conference on Empirical Methods in Natural Language Processing/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "naacl",
    label: (year) => `NAACL ${year}`,
    buckets: [
      {
        pattern: /^Findings of the Association for Computational Linguistics: NAACL /i,
        bucket: "findings",
      },
      {
        pattern:
          /^Proceedings of the \d{4} Conference of the North American Chapter of the Association for Computational Linguistics/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "chi",
    label: (year) => `CHI ${year}`,
    buckets: [
      {
        pattern:
          /^Proceedings of the Extended Abstracts of the (\d{4} )?CHI Conference on Human Factors in Computing Systems$/i,
        bucket: "poster",
      },
      {
        pattern: /^Extended Abstracts of the (\d{4} )?CHI Conference on Human Factors in Computing Systems$/i,
        bucket: "poster",
      },
      {
        pattern:
          /^Proceedings of the (\d{4} )?CHI Conference on Human Factors in Computing Systems$/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "uist",
    label: (year) => `UIST ${year}`,
    buckets: [
      {
        pattern: /^Adjunct Proceedings of the .*Symposium on User Interface Software and Technology/i,
        bucket: "poster",
      },
      {
        pattern: /Symposium on User Interface Software and Technology/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "iui",
    label: (year) => `IUI ${year}`,
    buckets: [
      {
        pattern: /Companion Proceedings of the .*International Conference on Intelligent User Interfaces/i,
        bucket: "poster",
      },
      {
        pattern: /International Conference on Intelligent User Interfaces/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "cscw",
    label: (year) => `CSCW ${year}`,
    buckets: [
      {
        pattern: /Companion Publication of the .*Conference on Computer[- ]Supported Cooperative Work/i,
        bucket: "poster",
      },
      {
        pattern: /Conference on Computer[- ]Supported Cooperative Work/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "dis",
    label: (year) => `DIS ${year}`,
    buckets: [
      {
        pattern: /Designing Interactive Systems Conference/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "assets",
    label: (year) => `ASSETS ${year}`,
    buckets: [
      {
        pattern: /SIGACCESS Conference on Computers and Accessibility/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "sigir",
    label: (year) => `SIGIR ${year}`,
    buckets: [
      {
        pattern: /International ACM SIGIR Conference on Research and Development in Information Retrieval/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "cikm",
    label: (year) => `CIKM ${year}`,
    buckets: [
      {
        pattern: /ACM International Conference on Information and Knowledge Management/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "recsys",
    label: (year) => `RecSys ${year}`,
    buckets: [
      {
        pattern: /ACM Conference on Recommender Systems/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "icwsm",
    label: (year) => `ICWSM ${year}`,
    buckets: [
      {
        pattern: /International AAAI Conference on Web and Social Media/i,
        bucket: "paper",
      },
    ],
  },
  {
    key: "cogsci",
    label: (year) => `CogSci ${year}`,
    buckets: [
      {
        pattern: /Annual Meeting of the Cognitive Science Society/i,
        bucket: "paper",
      },
    ],
  },
];

/**
 * @param {string | null | undefined} venue
 * @returns {{ rule: PaperNewsRule, bucket: NewsBucket } | null}
 */
export function matchPaperNewsRule(venue) {
  const value = venue ?? "";
  for (const rule of PAPER_NEWS_RULES) {
    for (const matcher of rule.buckets) {
      if (matcher.pattern.test(value)) return { rule, bucket: matcher.bucket };
    }
  }
  return null;
}

/** @param {string} key */
export function paperNewsRuleByKey(key) {
  return PAPER_NEWS_RULES.find((rule) => rule.key === key) ?? null;
}
