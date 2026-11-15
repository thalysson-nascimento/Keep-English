import assert from "node:assert/strict";
import { generateKeyPairSync, randomUUID, sign } from "node:crypto";
import test from "node:test";
import { getTestLockReason } from "../src/features/tests/domain/vocabulary-test";
import { verifyAdmobCallback } from "../src/features/tests/infrastructure/admob-verification";

test("a verified reward bypasses only the cooldown", () => {
  const access = { wordCount: 1, goal: 1, todayWords: 1, lastTestAt: 1000 };
  assert.equal(getTestLockReason(access, 2000), "cooldown");
  assert.equal(
    getTestLockReason({ ...access, cooldownBypass: true }, 2000),
    null,
  );
  assert.equal(
    getTestLockReason({ ...access, cooldownBypass: true, wordCount: 0 }, 2000),
    "words",
  );
  assert.equal(
    getTestLockReason({ ...access, cooldownBypass: true, todayWords: 0 }, 2000),
    "goal",
  );
});

test("AdMob verification rejects forged, modified and ambiguous callbacks", async () => {
  const { publicKey, privateKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });
  const key = publicKey.export({ type: "spki", format: "pem" }).toString();
  const getKey = async (id: number) => (id === 1 ? key : null);
  const id = randomUUID();
  const data = `ad_unit=unit%2F123&custom_data=${id}&reward_amount=1&timestamp=${Date.now()}&transaction_id=unique-test-transaction`;
  const signature = sign("sha256", Buffer.from(data), privateKey).toString(
    "base64url",
  );
  const callback = `${data}&signature=${signature}&key_id=1`;
  assert.equal((await verifyAdmobCallback(callback, getKey))?.custom_data, id);
  assert.equal(
    await verifyAdmobCallback(
      callback.replace("reward_amount=1", "reward_amount=2"),
      getKey,
    ),
    null,
  );
  assert.equal(
    await verifyAdmobCallback(callback.replace("key_id=1", "key_id=2"), getKey),
    null,
  );
  assert.equal(await verifyAdmobCallback(data, getKey), null);
  assert.equal(
    await verifyAdmobCallback(
      `${callback}&custom_data=${randomUUID()}`,
      getKey,
    ),
    null,
  );
  const duplicated = data + `&custom_data=${id}`;
  const duplicatedSignature = sign(
    "sha256",
    Buffer.from(duplicated),
    privateKey,
  ).toString("base64url");
  assert.equal(
    await verifyAdmobCallback(
      `${duplicated}&signature=${duplicatedSignature}&key_id=1`,
      getKey,
    ),
    null,
  );
});
