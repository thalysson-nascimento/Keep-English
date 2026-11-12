import "server-only";

import { headers } from "next/headers";
import { resolveLocale } from "./config";

export async function getRequestLocale() {
  const requestHeaders = await headers();
  return resolveLocale(requestHeaders.get("accept-language"));
}
