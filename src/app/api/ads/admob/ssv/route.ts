import { verifyAdmobCallback } from "@/features/tests/infrastructure/admob-verification";
import { confirmReward } from "@/features/tests/infrastructure/rewarded-test-access";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reward = await verifyAdmobCallback(url.search.slice(1));
  if (!reward) return new Response("Invalid signature", { status: 403 });
  const allowedUnit = process.env.ADMOB_REWARDED_AD_UNIT_ID;
  // Fail closed until the actual production ad unit is configured.
  if (!allowedUnit)
    return new Response("Ad unit is not configured", { status: 503 });
  if (reward.ad_unit !== allowedUnit)
    return new Response("Invalid ad unit", { status: 403 });
  const now = new Date();
  if (Math.abs(now.getTime() - reward.timestamp) > 30 * 60 * 1000) {
    return new Response("Expired reward", { status: 400 });
  }
  const accepted = await confirmReward(
    reward.custom_data,
    reward.transaction_id,
    now,
  );
  return new Response(accepted ? "OK" : "Reward expired or missing", {
    status: accepted ? 200 : 410,
  });
}
