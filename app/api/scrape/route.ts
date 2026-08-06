import { AdminSecretConfigurationError, isValidAdminSecret } from "@/lib/security/admin-secret";
import { runScrapingPipeline, SourceSelectionError } from "@/lib/scraping/pipeline";
import { scrapeRequestSchema } from "@/lib/scraping/types";

export const runtime = "nodejs";

const MAX_REQUEST_BODY_LENGTH = 10_000;

export async function POST(request: Request) {
  try {
    if (!isValidAdminSecret(request.headers.get("x-biasly-admin-secret"))) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }
  } catch (error) {
    if (error instanceof AdminSecretConfigurationError) {
      console.error("[scrape:configuration_error]", error.message);
      return Response.json({ error: "Scraping is not configured." }, { status: 500 });
    }
    throw error;
  }

  const parsedBody = await parseRequestBody(request);
  if (!parsedBody.ok) {
    return Response.json({ error: parsedBody.error }, { status: 400 });
  }

  const validation = scrapeRequestSchema.safeParse(parsedBody.value);
  if (!validation.success) {
    return Response.json(
      {
        error: "Invalid scrape request.",
        issues: validation.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const summary = await runScrapingPipeline(validation.data);
    return Response.json(summary, { status: summary.status === "failed" ? 502 : 200 });
  } catch (error) {
    if (error instanceof SourceSelectionError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    console.error(
      "[scrape:request_failed] Manual scrape could not run.",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "Unable to run the scraping pipeline." }, { status: 500 });
  }
}

async function parseRequestBody(
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REQUEST_BODY_LENGTH) {
    return { ok: false, error: "Request body is too large." };
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return { ok: false, error: "Unable to read request body." };
  }

  if (body.length > MAX_REQUEST_BODY_LENGTH) {
    return { ok: false, error: "Request body is too large." };
  }

  if (!body.trim()) {
    return { ok: true, value: {} };
  }

  try {
    return { ok: true, value: JSON.parse(body) };
  } catch {
    return { ok: false, error: "Request body must be valid JSON." };
  }
}

