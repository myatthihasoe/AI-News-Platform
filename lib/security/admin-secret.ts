import "server-only";

import { timingSafeEqual } from "node:crypto";

export class AdminSecretConfigurationError extends Error {
  constructor() {
    super("BIASLY_ADMIN_SECRET is not configured.");
    this.name = "AdminSecretConfigurationError";
  }
}

export function isValidAdminSecret(providedSecret: string | null): boolean {
  const expectedSecret = process.env.BIASLY_ADMIN_SECRET?.trim();

  if (!expectedSecret) {
    throw new AdminSecretConfigurationError();
  }

  if (!providedSecret) {
    return false;
  }

  const expected = Buffer.from(expectedSecret, "utf8");
  const provided = Buffer.from(providedSecret, "utf8");

  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

