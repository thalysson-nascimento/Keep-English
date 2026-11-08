import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/core/auth/auth";

type AuthHandlers = ReturnType<typeof toNextJsHandler>;
type AuthHandlerArguments = Parameters<AuthHandlers["GET"]>;

function getHandlers(): AuthHandlers {
  return toNextJsHandler(createAuth());
}

export function GET(...args: AuthHandlerArguments) {
  return getHandlers().GET(...args);
}

export function POST(...args: AuthHandlerArguments) {
  return getHandlers().POST(...args);
}
