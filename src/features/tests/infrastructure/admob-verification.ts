import "server-only";

import { verify } from "node:crypto";
import { z } from "zod";

const keysSchema = z.object({
  keys: z.array(z.object({ keyId: z.number().int(), pem: z.string() })),
});
const rewardSchema = z.object({
  custom_data: z.string().uuid(),
  transaction_id: z.string().min(1).max(256),
  ad_unit: z.string().min(1).max(128),
  reward_amount: z.coerce.number().positive(),
  timestamp: z.coerce.number().int().positive(),
});

export async function getAdmobPublicKey(keyId: number): Promise<string | null> {
  const response = await fetch(
    "https://www.gstatic.com/admob/reward/verifier-keys.json",
    {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!response.ok) throw new Error("AdMob verification keys unavailable.");
  const keys = keysSchema.parse(await response.json());
  return keys.keys.find((key) => key.keyId === keyId)?.pem ?? null;
}

export async function verifyAdmobCallback(
  rawQuery: string,
  getPublicKey: (keyId: number) => Promise<string | null> = getAdmobPublicKey,
) {
  if (rawQuery.length > 8192) return null;
  // Google signs the original bytes before the final signature and key_id fields.
  const parts = /^(.*)&signature=([A-Za-z0-9_-]+)&key_id=(\d+)$/.exec(rawQuery);
  if (!parts) return null;
  const [, signedContent, signature, keyId] = parts;
  const params = new URLSearchParams(signedContent);
  if ([...params.keys()].length !== new Set(params.keys()).size) return null;
  const parsed = rewardSchema.safeParse(Object.fromEntries(params));
  if (!parsed.success) return null;
  const key = await getPublicKey(Number(keyId));
  if (!key) return null;
  if (
    !verify(
      "sha256",
      Buffer.from(signedContent, "utf8"),
      key,
      Buffer.from(signature, "base64url"),
    )
  )
    return null;
  return parsed.data;
}
