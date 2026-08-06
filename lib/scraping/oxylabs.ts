import "server-only";

import { z } from "zod";
import {
  MAX_OXYLABS_RESPONSE_BYTES,
  MIN_USABLE_HTML_LENGTH,
  OXYLABS_TIMEOUT_MS,
} from "./constants";

const OXYLABS_REALTIME_ENDPOINT = "https://realtime.oxylabs.io/v1/queries";

const oxylabsResponseSchema = z.object({
  results: z
    .array(
      z.object({
        content: z.string(),
        status_code: z.number().int(),
        url: z.string().optional(),
      }),
    )
    .min(1),
});

export class OxylabsConfigurationError extends Error {
  constructor(variableName: string) {
    super(`Missing required server environment variable: ${variableName}`);
    this.name = "OxylabsConfigurationError";
  }
}

export class OxylabsRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OxylabsRequestError";
  }
}

export async function fetchHtmlThroughOxylabs(
  url: string,
  options: { render?: boolean } = {},
): Promise<string> {
  const firstHtml = await submitRealtimeRequest(url, options.render === true);

  if (isUsableHtml(firstHtml) || options.render === true) {
    return firstHtml;
  }

  return submitRealtimeRequest(url, true);
}

async function submitRealtimeRequest(url: string, render: boolean): Promise<string> {
  const username = requireEnvironmentVariable("OXY_WSA_USERNAME");
  const password = requireEnvironmentVariable("OXY_WSA_PASSWORD");
  const authorization = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
  let response: Response;

  try {
    response = await fetch(OXYLABS_REALTIME_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "universal",
        url,
        ...(render ? { render: "html" } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(OXYLABS_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new OxylabsRequestError("Oxylabs request timed out.");
    }

    throw new OxylabsRequestError("Unable to reach the Oxylabs Realtime API.");
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_OXYLABS_RESPONSE_BYTES) {
    throw new OxylabsRequestError("Oxylabs response exceeded the configured size limit.");
  }

  const responseText = await response.text();

  if (responseText.length > MAX_OXYLABS_RESPONSE_BYTES) {
    throw new OxylabsRequestError("Oxylabs response exceeded the configured size limit.");
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new OxylabsRequestError("Oxylabs rejected the configured credentials.");
    }

    if (response.status === 429) {
      throw new OxylabsRequestError("Oxylabs rate limit exceeded.");
    }

    throw new OxylabsRequestError(`Oxylabs request failed with HTTP ${response.status}.`);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(responseText);
  } catch {
    throw new OxylabsRequestError("Oxylabs returned an invalid JSON response.");
  }

  const parsed = oxylabsResponseSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new OxylabsRequestError("Oxylabs returned an unexpected response shape.");
  }

  const result = parsed.data.results[0];
  if (result.status_code < 200 || result.status_code >= 300) {
    throw new OxylabsRequestError(`Target page returned HTTP ${result.status_code}.`);
  }

  if (!result.content.trim()) {
    throw new OxylabsRequestError("Oxylabs returned empty page content.");
  }

  return result.content;
}

function requireEnvironmentVariable(name: "OXY_WSA_USERNAME" | "OXY_WSA_PASSWORD") {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new OxylabsConfigurationError(name);
  }
  return value;
}

function isUsableHtml(html: string) {
  return (
    html.trim().length >= MIN_USABLE_HTML_LENGTH &&
    /<(?:html|body|main|article)(?:\s|>)/i.test(html)
  );
}

