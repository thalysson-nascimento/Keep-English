"use client";

import { z } from "zod";

declare global {
  interface Window {
    KeepEnglishAds?: {
      getRewardedInterstitialVersion?: () => number;
      showRewardedInterstitial: (requestId: string) => void;
    };
  }
}

const resultSchema = z.object({
  requestId: z.string().uuid(),
  earned: z.boolean(),
  error: z.string().optional(),
});

export function isRewardedAdSupported(): boolean {
  return (window.KeepEnglishAds?.getRewardedInterstitialVersion?.() ?? 0) >= 2;
}

export function showRewardedAd(requestId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!isRewardedAdSupported()) {
      reject(new Error("unavailable"));
      return;
    }
    const timeoutId = window.setTimeout(
      () => finish(new Error("timeout")),
      180_000,
    );
    function finish(error?: Error, earned = false) {
      window.clearTimeout(timeoutId);
      window.removeEventListener("keepEnglishRewardedInterstitial", listener);
      if (error) reject(error);
      else resolve(earned);
    }
    function listener(event: Event) {
      if (!(event instanceof CustomEvent)) return;
      const parsed = resultSchema.safeParse(event.detail);
      if (!parsed.success || parsed.data.requestId !== requestId) return;
      finish(
        parsed.data.error ? new Error("ad_failed") : undefined,
        parsed.data.earned,
      );
    }
    window.addEventListener("keepEnglishRewardedInterstitial", listener);
    try {
      window.KeepEnglishAds?.showRewardedInterstitial(requestId);
    } catch {
      finish(new Error("ad_failed"));
    }
  });
}
