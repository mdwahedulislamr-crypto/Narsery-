// Meta Pixel Helper for Taqwa Agro Limited

const PIXEL_ID = "1026750540256061";

// Safely types window for FB pixel
declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/**
 * Initializes and injects the Meta Pixel code into the DOM.
 */
export function initPixel() {
  if (typeof window === "undefined") return;

  // Prevent double initialization
  if (window.fbq) return;

  const fbq: any = function(...args: any[]) {
    fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args);
  };
  window.fbq = fbq;
  window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  // Ingest the pixel script
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  // Initialize and track PageView
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");

  console.log(`[Meta Pixel] Initialized successfully with ID: ${PIXEL_ID}`);
}

/**
 * Tracks a custom or standard Meta Pixel event.
 */
export function trackEvent(eventName: string, data?: object) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, data);
    console.log(`[Meta Pixel Event Tracked] ${eventName}:`, data);
  } else {
    console.warn(`[Meta Pixel] fbq not available. Retrying event: ${eventName}`);
  }
}

/**
 * Tracks an order purchase event.
 */
export function trackPurchase(value: number = 4500, currency: string = "BDT") {
  trackEvent("Purchase", {
    value,
    currency,
    content_name: "জাপানিজ ফুইয়ু জাতের পার্সিমন চারাগাছ প্যাকেজ",
    content_category: "চারাগাছ / চারা",
    content_type: "product",
    num_items: 2
  });
}

/**
 * Tracks a lead generation (order checkout form submission).
 */
export function trackLead() {
  trackEvent("Lead", {
    content_name: "পার্সিমন চারাগাছ ধামাকা প্যাকেজ",
    value: 4500,
    currency: "BDT"
  });
}

/**
 * Tracks an initiate checkout event (e.g. when scrolling to the order form or clicking order buttons).
 */
export function trackInitiateCheckout() {
  trackEvent("InitiateCheckout", {
    content_name: "জাপানিজ ফুইয়ু জাতের পার্সিমন চারাগাছ প্যাকেজ",
    value: 4500,
    currency: "BDT"
  });
}

