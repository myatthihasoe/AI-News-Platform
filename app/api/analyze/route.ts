import { runAnalysisPipeline } from "@/lib/analysis/pipeline";
import { AnalysisConfigurationError, assertAnalysisConfiguration } from "@/lib/analysis/model";
import { analysisRequestSchema } from "@/lib/analysis/schema";
import { AdminSecretConfigurationError, isValidAdminSecret } from "@/lib/security/admin-secret";

export const runtime = "nodejs";

const MAX_REQUEST_BODY_LENGTH = 10_000;

export async function POST(request: Request) {
  try {
    if (!isValidAdminSecret(request.headers.get("x-biasly-admin-secret"))) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }
    assertAnalysisConfiguration();
  } catch (error) {
    if (error instanceof AdminSecretConfigurationError || error instanceof AnalysisConfigurationError) {
      console.error("[analysis:configuration_error]", error.message);
      return Response.json({ error: "AI analysis is not configured." }, { status: 500 });
    }
    throw error;
  }

  const parsedBody = await parseRequestBody(request);
  if (!parsedBody.ok) return Response.json({ error: parsedBody.error }, { status: 400 });

  const validation = analysisRequestSchema.safeParse(parsedBody.value);
  if (!validation.success) {
    return Response.json({
      error: "Invalid analysis request.",
      issues: validation.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    }, { status: 400 });
  }

  try {
    const summary = await runAnalysisPipeline(validation.data);
    return Response.json(summary, { status: summary.status === "failed" ? 502 : 200 });
  } catch (error) {
    console.error(
      "[analysis:request_failed] AI analysis could not run.",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "Unable to run the AI analysis pipeline." }, { status: 500 });
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
  if (!body.trim()) return { ok: true, value: {} };

  try {
    return { ok: true, value: JSON.parse(body) };
  } catch {
    return { ok: false, error: "Request body must be valid JSON." };
  }
}
