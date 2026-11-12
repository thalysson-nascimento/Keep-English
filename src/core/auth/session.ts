import "server-only";

import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createAuth } from "@/core/auth/auth";

export async function getSessionFromHeaders(requestHeaders: Headers) {
  return createAuth().api.getSession({ headers: requestHeaders });
}

export async function getCurrentSession() {
  await connection();
  return getSessionFromHeaders(await headers());
}

export async function requireCurrentUserId(): Promise<string> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session.user.id;
}
