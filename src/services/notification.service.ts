/**
 * Attendex — Notification Service
 * 
 * Provider-agnostic notification abstraction.
 * Swappable between MSG91, WhatsApp, Email, or Console (dev).
 * No UI code. No React. Pure async logic.
 */

import type { NotificationChannel } from "@/types";

// ─── Provider Interface ──────────────────────────────────────
export interface NotificationProvider {
  readonly name: string;
  send(to: string, message: string): Promise<NotificationResult>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─── Console Provider (Development) ──────────────────────────
export class ConsoleNotificationProvider implements NotificationProvider {
  readonly name = "Console";

  async send(to: string, message: string): Promise<NotificationResult> {
    console.log(`[NOTIFICATION] To: ${to}`);
    console.log(`[NOTIFICATION] Message: ${message}`);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));
    return { success: true, messageId: `dev-${Date.now()}` };
  }
}

// ─── MSG91 Provider (Production SMS) ─────────────────────────
export class MSG91Provider implements NotificationProvider {
  readonly name = "MSG91";

  async send(to: string, message: string): Promise<NotificationResult> {
    const authKey = process.env.MSG91_AUTH_KEY;
    const senderId = process.env.MSG91_SENDER_ID || "ATNDLY";

    if (!authKey || authKey === "your_msg91_auth_key_here") {
      console.warn("[MSG91] Auth key not configured. Falling back to console.");
      return new ConsoleNotificationProvider().send(to, message);
    }

    try {
      // MSG91 API integration point
      // In production, this would be a real fetch call
      const response = await fetch("https://api.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: authKey,
        },
        body: JSON.stringify({
          sender: senderId,
          route: "4",
          country: "91",
          sms: [{ message, to: [to] }],
        }),
      });

      if (!response.ok) {
        throw new Error(`MSG91 returned ${response.status}`);
      }

      const data = await response.json();
      return { success: true, messageId: data.request_id };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(`[MSG91] Failed: ${msg}`);
      return { success: false, error: msg };
    }
  }
}

// ─── Notification Service (Facade) ───────────────────────────
class NotificationService {
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();

  constructor() {
    // Default: console provider for all channels in development
    const consoleFallback = new ConsoleNotificationProvider();
    this.providers.set("SMS", consoleFallback);
    this.providers.set("WHATSAPP", consoleFallback);
    this.providers.set("EMAIL", consoleFallback);
    this.providers.set("PUSH", consoleFallback);
  }

  /**
   * Register a provider for a specific channel.
   * Call this at app initialization to swap in real providers.
   */
  registerProvider(channel: NotificationChannel, provider: NotificationProvider) {
    this.providers.set(channel, provider);
  }

  /**
   * Send a notification through the appropriate channel.
   */
  async send(
    to: string,
    message: string,
    channel: NotificationChannel = "SMS"
  ): Promise<NotificationResult> {
    const provider = this.providers.get(channel);
    if (!provider) {
      return { success: false, error: `No provider registered for channel: ${channel}` };
    }
    return provider.send(to, message);
  }

  /**
   * Send bulk notifications. Returns array of results.
   * Uses Promise.allSettled to avoid one failure blocking others.
   */
  async sendBulk(
    recipients: Array<{ to: string; message: string; channel?: NotificationChannel }>
  ): Promise<NotificationResult[]> {
    const results = await Promise.allSettled(
      recipients.map((r) => this.send(r.to, r.message, r.channel || "SMS"))
    );

    return results.map((r) =>
      r.status === "fulfilled"
        ? r.value
        : { success: false, error: r.reason?.message || "Unknown error" }
    );
  }
}

// Singleton export
export const notificationService = new NotificationService();


