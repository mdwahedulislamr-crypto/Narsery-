// Telegram Bot Notification Service for Al khair agro LTD

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  alternateBotToken?: string;
  alternateChatId?: string;
  isEnabled: boolean;
}

export interface TelegramOrderDetails {
  orderId: string;
  name: string;
  mobile: string;
  address: string;
  district?: string;
  deliveryArea?: string;
  packageName: string;
  packageQty: number;
  itemsPrice: number;
  deliveryCharge: number;
  totalPrice: number;
  paymentMethod: string;
  transactionId?: string;
  note?: string;
  dateStr: string;
}

export interface TelegramNotificationLog {
  id: string;
  timestamp: string;
  orderId: string;
  customerName: string;
  mobile: string;
  totalPrice: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  errorDetails?: string;
  attemptedToken?: string;
  attemptedChatId?: string;
}

// Default credentials provided by user
export const DEFAULT_TELEGRAM_BOT_TOKEN = "8493047868:AAH0200097KvA3fq_tUkiMDF_MRWBS-1Z8M";
export const ALTERNATE_TELEGRAM_BOT_TOKEN = "38767296399:AAH0200097KvA3fq_tUkiMDF_MRWBS-1Z8M";
export const DEFAULT_TELEGRAM_CHAT_ID = "38767296399";
export const ALTERNATE_TELEGRAM_CHAT_ID = "8493047868";

const CONFIG_STORAGE_KEY = "alkhair_telegram_config";
const LOGS_STORAGE_KEY = "alkhair_telegram_logs";

/**
 * Retrieves the currently active Telegram Bot configuration
 */
export function getTelegramConfig(): TelegramConfig {
  if (typeof window === "undefined") {
    return {
      botToken: DEFAULT_TELEGRAM_BOT_TOKEN,
      chatId: DEFAULT_TELEGRAM_CHAT_ID,
      alternateBotToken: ALTERNATE_TELEGRAM_BOT_TOKEN,
      alternateChatId: ALTERNATE_TELEGRAM_CHAT_ID,
      isEnabled: true,
    };
  }

  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        botToken: parsed.botToken || DEFAULT_TELEGRAM_BOT_TOKEN,
        chatId: parsed.chatId || DEFAULT_TELEGRAM_CHAT_ID,
        alternateBotToken: parsed.alternateBotToken || ALTERNATE_TELEGRAM_BOT_TOKEN,
        alternateChatId: parsed.alternateChatId || ALTERNATE_TELEGRAM_CHAT_ID,
        isEnabled: parsed.isEnabled !== false,
      };
    }
  } catch (e) {
    console.warn("Failed to read telegram config from localStorage:", e);
  }

  return {
    botToken: DEFAULT_TELEGRAM_BOT_TOKEN,
    chatId: DEFAULT_TELEGRAM_CHAT_ID,
    alternateBotToken: ALTERNATE_TELEGRAM_BOT_TOKEN,
    alternateChatId: ALTERNATE_TELEGRAM_CHAT_ID,
    isEnabled: true,
  };
}

/**
 * Saves updated Telegram Bot configuration
 */
export function saveTelegramConfig(config: Partial<TelegramConfig>): TelegramConfig {
  const current = getTelegramConfig();
  const updated: TelegramConfig = {
    ...current,
    ...config,
  };

  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save telegram config:", e);
  }

  return updated;
}

/**
 * Formats a clean, high-conversion HTML message for Telegram notification
 */
export function formatTelegramOrderMessage(order: TelegramOrderDetails): string {
  const escapeHtml = (text?: string) => {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  const lines = [
    `🌿 <b>আল খায়ের এগ্রো — নতুন অর্ডার গৃহীত হয়েছে!</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🆔 <b>অর্ডার নং:</b> <code>#${escapeHtml(order.orderId)}</code>`,
    `👤 <b>গ্রাহক:</b> ${escapeHtml(order.name)}`,
    `📞 <b>মোবাইল:</b> <a href="tel:${escapeHtml(order.mobile)}">${escapeHtml(order.mobile)}</a>`,
    `🏡 <b>ঠিকানা:</b> ${escapeHtml(order.address)}`,
    `📍 <b>জেলা / এরিয়া:</b> ${escapeHtml(order.district || order.deliveryArea || "প্রযোজ্য নয়")}`,
    ``,
    `📦 <b>প্যাকেজ:</b> ${escapeHtml(order.packageName)}`,
    `🔢 <b>পরিমাণ:</b> ${order.packageQty} টি চারা`,
    `💰 <b>চারার মূল্য:</b> ৳${order.itemsPrice.toLocaleString("bn-BD")}`,
    `🚚 <b>ডেলিভারি চার্জ:</b> ৳${order.deliveryCharge.toLocaleString("bn-BD")} (অগ্রিম বিকাশ/নগদ)`,
    `💵 <b>সর্বমোট প্রদেয়:</b> <b>৳${order.totalPrice.toLocaleString("bn-BD")}</b>`,
    ``,
    `💳 <b>পেমেন্ট মেথড:</b> ${escapeHtml(order.paymentMethod)}`,
  ];

  if (order.transactionId) {
    lines.push(`📝 <b>ট্রানজেকশন আইডি:</b> <code>${escapeHtml(order.transactionId)}</code>`);
  }

  if (order.note) {
    lines.push(`💬 <b>কাস্টমার নোট:</b> <i>${escapeHtml(order.note)}</i>`);
  }

  lines.push(`⏰ <b>সময়:</b> ${escapeHtml(order.dateStr)}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`✅ <i>কাস্টমারের সাথে ফোনে কথা বলে পার্সেল বুকিং নিশ্চিত করুন।</i>`);

  return lines.join("\n");
}

/**
 * Saves log of notification transmission
 */
function recordNotificationLog(log: Omit<TelegramNotificationLog, 'id'>) {
  try {
    const existing: TelegramNotificationLog[] = JSON.parse(
      localStorage.getItem(LOGS_STORAGE_KEY) || "[]"
    );
    const newEntry: TelegramNotificationLog = {
      id: `tlg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...log,
    };
    const updated = [newEntry, ...existing].slice(0, 50);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to record telegram notification log:", e);
  }
}

/**
 * Retrieves all stored Telegram notification logs
 */
export function getTelegramNotificationLogs(): TelegramNotificationLog[] {
  try {
    return JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Core function to send message via Telegram Bot API with automatic failover
 */
async function executeTelegramSend(
  token: string, 
  chatId: string, 
  text: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (data && data.ok) {
      return { success: true, data };
    } else {
      return { 
        success: false, 
        error: data?.description || `HTTP ${response.status}: Failed to send message` 
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Network error when reaching api.telegram.org",
    };
  }
}

/**
 * Sends automated real-time notification to Telegram when an order is placed
 */
export async function sendTelegramOrderNotification(
  order: TelegramOrderDetails
): Promise<{ success: boolean; error?: string }> {
  const config = getTelegramConfig();

  if (!config.isEnabled) {
    console.log("[Telegram] Notification disabled in config");
    return { success: false, error: "Telegram notification is disabled" };
  }

  const message = formatTelegramOrderMessage(order);
  const now = new Date().toLocaleTimeString("bn-BD");

  // Attempt 1: Configured botToken and chatId
  let result = await executeTelegramSend(config.botToken, config.chatId, message);

  // Attempt 2: If failed and alternate credentials exist, try fallback
  if (!result.success && config.alternateBotToken && config.alternateChatId) {
    console.warn("[Telegram] Attempt 1 failed, trying fallback credentials...", result.error);
    result = await executeTelegramSend(config.alternateBotToken, config.alternateChatId, message);
  }

  // Attempt 3: If still failed and alternate Chat ID can be paired with primary token
  if (!result.success && config.alternateChatId && config.chatId !== config.alternateChatId) {
    result = await executeTelegramSend(config.botToken, config.alternateChatId, message);
  }

  // Record log
  recordNotificationLog({
    timestamp: now,
    orderId: order.orderId,
    customerName: order.name,
    mobile: order.mobile,
    totalPrice: order.totalPrice,
    status: result.success ? "SUCCESS" : "FAILED",
    errorDetails: result.error,
    attemptedToken: config.botToken.substring(0, 10) + "...",
    attemptedChatId: config.chatId,
  });

  if (result.success) {
    console.log(`[Telegram] Order notification sent successfully for Order #${order.orderId}`);
  } else {
    console.warn(`[Telegram] Notification failed for Order #${order.orderId}:`, result.error);
  }

  return result;
}

/**
 * Sends a test notification to verify Bot API Token and Chat ID
 */
export async function testTelegramConnection(
  customToken?: string,
  customChatId?: string
): Promise<{ success: boolean; message: string; responseData?: any }> {
  const config = getTelegramConfig();
  const token = (customToken || config.botToken).trim();
  const chatId = (customChatId || config.chatId).trim();

  if (!token) {
    return { success: false, message: "বট টোকেন (Bot Token) দেওয়া হয়নি।" };
  }
  if (!chatId) {
    return { success: false, message: "চ্যাট আইডি (Chat ID) দেওয়া হয়নি।" };
  }

  const testMessage = [
    `🔔 <b>আল খায়ের এগ্রো — টেলিগ্রাম নোটিফিকেশন টেস্ট</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✅ <b>অভিনন্দন!</b> আপনার টেলিগ্রাম বট সফলভাবে কানেক্ট হয়েছে।`,
    `🌱 এখন থেকে ল্যান্ডিং পেজে যেকোনো নতুন অর্ডার আসার সাথে সাথে আপনার টেলিগ্রামে স্বয়ংক্রিয় নোটিফিকেশন পৌঁছে যাবে।`,
    ``,
    `⏰ <b>টেস্ট সময়:</b> ${new Date().toLocaleString("bn-BD")}`,
    `🤖 <b>বট টোকেন প্রিফিক্স:</b> <code>${token.substring(0, 10)}...</code>`,
    `💬 <b>চ্যাট আইডি:</b> <code>${chatId}</code>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  ].join("\n");

  const result = await executeTelegramSend(token, chatId, testMessage);

  if (result.success) {
    return {
      success: true,
      message: "সফল হয়েছে! আপনার টেলিগ্রামে টেস্ট নোটিফিকেশন মেসেজ চলে গেছে।",
      responseData: result.data,
    };
  } else {
    // Provide user-friendly guidance in Bengali
    let friendlyTip = "";
    if (result.error?.includes("Unauthorized")) {
      friendlyTip = "বট টোকেনটি সঠিক নয়। @BotFather থেকে আপনার বটের সঠিক HTTP API Token কপি করে পেস্ট করুন।";
    } else if (result.error?.includes("chat not found")) {
      friendlyTip = "টেলিগ্রামে আপনার বটটিকে খুঁজে বের করে প্রথমে <b>/start</b> কমান্ড চাপুন অথবা আপনার সঠিক Chat ID দিন।";
    }

    return {
      success: false,
      message: `ব্যর্থ হয়েছে: ${result.error || "অজানা ত্রুটি"} ${friendlyTip ? `<br/><span class="text-amber-300 font-bold">${friendlyTip}</span>` : ""}`,
      responseData: result.error,
    };
  }
}
