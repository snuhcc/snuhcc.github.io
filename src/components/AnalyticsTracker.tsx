"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import {
  GA_MEASUREMENT_ID,
  trackEvent,
  trackPageView,
  trackWebVital,
} from "@/lib/analytics";

const CLICK_SELECTOR = "[data-analytics-event]";
const SECTION_SELECTOR = "[data-analytics-section]";

function serializeAnalyticsData(element: HTMLElement) {
  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(element.dataset)) {
    if (!key.startsWith("analytics") || key === "analyticsEvent" || !value) {
      continue;
    }

    const normalized = key.slice("analytics".length);
    if (!normalized) continue;

    const camelKey = normalized.charAt(0).toLowerCase() + normalized.slice(1);
    const snakeKey = camelKey.replace(
      /[A-Z]/g,
      (character) => `_${character.toLowerCase()}`
    );

    params[snakeKey] = value;
  }

  return params;
}

function currentPagePath() {
  return `${window.location.pathname}${window.location.search}`;
}

function currentPageParams() {
  return {
    page_path: currentPagePath(),
    page_title: document.title,
  };
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useReportWebVitals(trackWebVital);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const target = event.target.closest<HTMLElement>(CLICK_SELECTOR);
      if (!target) return;

      const eventName = target.dataset.analyticsEvent;
      if (!eventName) return;

      const section =
        target.dataset.analyticsSection ??
        target
          .closest<HTMLElement>(SECTION_SELECTOR)
          ?.dataset.analyticsSection;
      const href = target.getAttribute("href");
      const linkUrl = href?.startsWith("mailto:") ? "mailto" : href || undefined;
      const label =
        target.dataset.analyticsLabel ??
        target.textContent?.trim().replace(/\s+/g, " ").slice(0, 120);

      trackEvent(eventName, {
        ...serializeAnalyticsData(target),
        ...currentPageParams(),
        section,
        label,
        link_url: linkUrl,
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    trackPageView(currentPagePath());
  }, [pathname, search]);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const seenSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const section = (entry.target as HTMLElement).dataset.analyticsSection;
          if (!section || seenSections.has(section)) return;

          seenSections.add(section);
          trackEvent("section_view", {
            ...serializeAnalyticsData(entry.target as HTMLElement),
            ...currentPageParams(),
            section,
          });
        });
      },
      {
        threshold: 0.35,
        rootMargin: "-72px 0px -20% 0px",
      }
    );

    document
      .querySelectorAll<HTMLElement>(SECTION_SELECTOR)
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pathname, search]);

  return null;
}
