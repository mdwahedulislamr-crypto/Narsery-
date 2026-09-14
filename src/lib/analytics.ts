// Google Analytics (GA4) Helper for Al khair agro LTD (Measurement ID: G-2Z0X5E398P)

export const GA_MEASUREMENT_ID = "G-2Z0X5E398P";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Track Google Analytics 4 standard and custom events
 */
export function trackGAEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, {
        send_to: GA_MEASUREMENT_ID,
        ...params,
      });
      console.log(`[GA4] Tracked ${eventName}:`, params);
    } else {
      // If gtag is not ready yet, push to dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }
  } catch (err) {
    console.warn("[GA4] Track error:", err);
  }
}

/**
 * Track user initiating checkout / clicking to scroll to form
 */
export function trackGABeginCheckout(packageName: string, value: number, quantity: number) {
  trackGAEvent("begin_checkout", {
    currency: "BDT",
    value: value,
    items: [
      {
        item_id: `pkg_${quantity}`,
        item_name: packageName,
        quantity: quantity,
        price: value,
      },
    ],
  });
}

/**
 * Track lead submission
 */
export function trackGALead(value: number, packageName: string) {
  trackGAEvent("generate_lead", {
    currency: "BDT",
    value: value,
    item_name: packageName,
  });
}

/**
 * Track completed purchase event in Google Analytics
 */
export function trackGAPurchase(
  transactionId: string,
  totalPrice: number,
  packageName: string,
  deliveryCharge: number,
  quantity: number
) {
  trackGAEvent("purchase", {
    transaction_id: transactionId,
    value: totalPrice,
    currency: "BDT",
    shipping: deliveryCharge,
    items: [
      {
        item_id: `rambutan_${quantity}_plant`,
        item_name: packageName,
        price: totalPrice - deliveryCharge,
        quantity: quantity,
      },
    ],
  });
}
