import "server-only";

type SupabaseErrorLike = {
  code?: string;
  message: string;
};

export function throwSupabaseError(context: string, error: SupabaseErrorLike): never {
  const code = error.code ? ` (${error.code})` : "";
  throw new Error(`${context}${code}: ${error.message}`);
}
