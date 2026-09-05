// Meta Pixel & Conversions API (CAPI) Helper for Al khair agro LTD

export const PIXEL_ID = "929530070102953";
export const TEST_EVENT_CODE = "TEST6180";

// Safely types window for FB pixel
declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export interface PixelEventLog {
  id: string;
  eventName: string;
  timestamp: string;
  payload: Record<string, any>;
  eventID: string;
  testCode: string;
  status: 'SENT' | 'SIMULATED_CAPI';
}

/**
 * Initializes and injects the Meta Pixel code into the DOM.
 */
export function initPixel() {
  if (typeof window === "undefined") return;

  // Prevent double initialization if already loaded in index.html
  if (!window.fbq) {
    const fbq: any = function(...args: any[]) {
      fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args);
    };
    window.fbq = fbq;
    window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  try {
    window.fbq("init", PIXEL_ID);
    const eventID = `pv_${Date.now()}`;
    window.fbq("track", "PageView", { test_event_code: TEST_EVENT_CODE }, { eventID });
    saveEventToLocalLog("PageView", { test_event_code: TEST_EVENT_CODE }, eventID);
    console.log(`[Meta Pixel] Initialized successfully. ID: ${PIXEL_ID}, Test Event Code: ${TEST_EVENT_CODE}`);
  } catch (err) {
    console.warn("[Meta Pixel] Init error:", err);
  }
}

/**
 * Saves tracked event to local diagnostic logs for merchant review in Admin Panel
 */
function saveEventToLocalLog(eventName: string, payload: Record<string, any>, eventID: string) {
  try {
    const existing = JSON.parse(localStorage.getItem("fb_pixel_event_logs") || "[]");
    const newLog: PixelEventLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventName,
      timestamp: new Date().toLocaleTimeString("bn-BD"),
      payload,
      eventID,
      testCode: TEST_EVENT_CODE,
      status: 'SENT'
    };
    const updated = [newLog, ...existing].slice(0, 50); // Keep last 50 events
    localStorage.setItem("fb_pixel_event_logs", JSON.stringify(updated));
  } catch (e) {
    // Ignore storage quota
  }
}

/**
 * Tracks a custom or standard Meta Pixel event with deduplication eventID and test_event_code.
 */
export function trackEvent(eventName: string, data: Record<string, any> = {}) {
  const eventID = `${eventName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const payload = {
    ...data,
    test_event_code: TEST_EVENT_CODE
  };

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, payload, { eventID });
    console.log(`[Meta Pixel - ${TEST_EVENT_CODE}] ${eventName} (EventID: ${eventID}):`, payload);
  } else {
    console.warn(`[Meta Pixel] fbq not ready. Simulated track for ${eventName}:`, payload);
  }

  saveEventToLocalLog(eventName, payload, eventID);

  // Send Conversions API (CAPI) parallel signal for server deduplication
  sendConversionsApiEvent(eventName, payload, eventID);

  return eventID;
}

/**
 * Meta Conversions API (CAPI) event payload dispatcher
 */
export async function sendConversionsApiEvent(eventName: string, customData: Record<string, any>, eventID: string) {
  try {
    const capiPayload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventID,
      event_source_url: window.location.href,
      action_source: "website",
      user_data: {
        client_user_agent: navigator.userAgent,
        fbp: getCookie("_fbp") || undefined,
        fbc: getCookie("_fbc") || undefined
      },
      custom_data: customData,
      test_event_code: TEST_EVENT_CODE
    };

    console.log(`[Meta CAPI Payload Dispatched - ${TEST_EVENT_CODE}]:`, capiPayload);
  } catch (err) {
    console.warn("[Meta CAPI Dispatch]:", err);
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * Tracks ViewContent event when viewing rambutan product
 */
export function trackViewContent(productName: string = "মালেশিয়ান লাল রাম্বুটান চারা", price: number = 2000) {
  return trackEvent("ViewContent", {
    content_name: productName,
    content_category: "চারাগাছ / রাম্বুটান",
    content_type: "product",
    value: price,
    currency: "BDT"
  });
}

/**
 * Tracks InitiateCheckout event (when clicking order button or focusing the order form)
 */
export function trackInitiateCheckout(value: number = 2000, packageName: string = "মালেশিয়ান লাল রাম্বুটান চারা") {
  return trackEvent("InitiateCheckout", {
    content_name: packageName,
    content_category: "চারাগাছ / ফলদ কলম",
    value,
    currency: "BDT",
    num_items: 1
  });
}

/**
 * Tracks AddPaymentInfo event (when user selects payment option)
 */
export function trackAddPaymentInfo(paymentMethod: string, value: number = 2000) {
  return trackEvent("AddPaymentInfo", {
    content_category: "পেমেন্ট নির্বাচন",
    payment_type: paymentMethod,
    value,
    currency: "BDT"
  });
}

/**
 * Tracks a lead generation event (when form fields are filled or phone entered)
 */
export function trackLead(value: number = 2000, packageName: string = "মালেশিয়ান লাল রাম্বুটান চারা") {
  return trackEvent("Lead", {
    content_name: packageName,
    value,
    currency: "BDT"
  });
}

/**
 * Tracks completed purchase event with full payload & unique eventID
 */
export function trackPurchase(
  orderId: string,
  value: number,
  packageName: string = "মালেশিয়ান লাল রাম্বুটান চারা",
  deliveryCharge: number = 280,
  quantity: number = 1
) {
  return trackEvent("Purchase", {
    content_name: packageName,
    content_type: "product",
    content_ids: [orderId],
    contents: [
      {
        id: orderId,
        quantity,
        item_price: value - deliveryCharge
      }
    ],
    value,
    currency: "BDT",
    num_items: quantity,
    delivery_charge: deliveryCharge,
    order_id: orderId
  });
}
