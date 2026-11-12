import { z } from "zod";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function requestApiJson<TSchema extends z.ZodType>(
  input: RequestInfo | URL,
  schema: TSchema,
  init?: RequestInit,
): Promise<z.output<TSchema>> {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch {
    throw new ApiRequestError("network");
  }

  if (!response.ok) {
    throw new ApiRequestError("http", response.status);
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new ApiRequestError("invalid-json", response.status);
  }

  const parsed = schema.safeParse(result);

  if (!parsed.success) {
    throw new ApiRequestError("invalid-response", response.status);
  }

  return parsed.data;
}

export async function requestApiVoid(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch {
    throw new ApiRequestError("network");
  }

  if (!response.ok) {
    throw new ApiRequestError("http", response.status);
  }
}

export function notifyAccountDataChanged(): void {
  window.dispatchEvent(new Event("keep-english:account-data-changed"));
}

export function subscribeToAccountDataChanged(
  listener: () => void,
): () => void {
  const eventName = "keep-english:account-data-changed";
  window.addEventListener(eventName, listener);

  return () => window.removeEventListener(eventName, listener);
}
