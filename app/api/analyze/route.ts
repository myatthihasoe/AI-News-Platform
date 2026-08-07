import {
  AnalysisConfigurationError,
  MAX_ANALYSIS_REQUEST_BODY_LENGTH,
  assertAnalysisConfiguration,
} from "@/lib/analysis/constants";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";
import { analysisRequestSchema } from "@/lib/analysis/types";
import { AdminSecretConfigurationError, isValidAdminSecret } from "@/lib/security/admin-secret";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isValidAdminSecret(request.headers.get("x-biasly-admin-secret"))) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }
  } catch (error) {
    if (error instanceof AdminSecretConfigurationError) {
      console.error("[analysis:configuration_error] Analysis admin access is not configured.");
      return Response.json({ error: "Analysis is not configured." }, { status: 500 });
    }
    throw error;
  }

  const parsedBody = await parseRequestBody(request);
  if (!parsedBody.ok) {
    return Response.json({ error: parsedBody.error }, { status: 400 });
  }

  const validation = analysisRequestSchema.safeParse(parsedBody.value);
  if (!validation.success) {
    return Response.json(
      {
        error: "Invalid analysis request.",
        issues: validation.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    assertAnalysisConfiguration();
  } catch (error) {
    if (error instanceof AnalysisConfigurationError) {
      console.error("[analysis:configuration_error] Analysis dependencies are not configured.");
      return Response.json({ error: "Analysis is not configured." }, { status: 500 });
    }
    throw error;
  }

  try {
    const summary = await runAnalysisPipeline(validation.data);
    return Response.json(summary, { status: summary.status === "failed" ? 502 : 200 });
  } catch {
    console.error("[analysis:request_failed] The analysis request could not run.");
    return Response.json({ error: "Unable to run the analysis pipeline." }, { status: 500 });
  }
}

async function parseRequestBody(
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_ANALYSIS_REQUEST_BODY_LENGTH) {
    return { ok: false, error: "Request body is too large." };
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return { ok: false, error: "Unable to read request body." };
  }

  if (body.length > MAX_ANALYSIS_REQUEST_BODY_LENGTH) {
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
