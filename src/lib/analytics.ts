export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

type AnalyticsValue = string | number | boolean | undefined;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (
      command: "js" | "config" | "event",
      target: string | Date,
      params?: Record<string, AnalyticsValue>
    ) => void;
  }
}

function isTrackingReady() {
  return (
    typeof window !== "undefined" &&
    GA_MEASUREMENT_ID.length > 0 &&
    typeof window.gtag === "function"
  );
}

function baseParams(params: Record<string, AnalyticsValue> = {}) {
  return {
    send_to: GA_MEASUREMENT_ID,
    ...params,
  };
}

export function trackPageView(pagePath: string) {
  if (!isTrackingReady()) return;

  const pageLocation = new URL(pagePath, window.location.origin);

  window.gtag?.(
    "event",
    "page_view",
    baseParams({
      page_location: pageLocation.toString(),
      page_path: `${pageLocation.pathname}${pageLocation.search}`,
      page_title: document.title,
    })
  );
}

export function trackEvent(
  eventName: string,
  params: Record<string, AnalyticsValue> = {}
) {
  if (!isTrackingReady()) return;
  window.gtag?.("event", eventName, baseParams(params));
}

type WebVitalsMetric = {
  id: string;
  name: string;
  value: number;
  rating?: string;
  navigationType?: string;
};

export function trackWebVital(metric: WebVitalsMetric) {
  trackEvent("web_vital", {
    metric_id: metric.id,
    metric_name: metric.name,
    metric_value: Math.round(
      metric.name === "CLS" ? metric.value * 1000 : metric.value
    ),
    metric_rating: metric.rating,
    navigation_type: metric.navigationType,
    non_interaction: true,
  });
}
