import "server-only";

import { headers } from "next/headers";
import type { ReactNode } from "react";
import { resolveLocale } from "./config";
import { LocaleProvider } from "./locale-provider";

export async function RequestLocaleProvider({
  children,
}: {
  children: ReactNode;
}) {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("accept-language"));

  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
