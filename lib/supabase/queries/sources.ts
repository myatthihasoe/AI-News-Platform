import "server-only";

import { getSupabaseServiceClient } from "../client";
import { throwSupabaseError } from "../errors";
import type { Json } from "../types";

export type ActiveSource = {
  id: number;
  name: string;
  listingUrl: string;
  parserStrategy: Json;
  logoUrl: string | null;
};

export async function getActiveSources(): Promise<ActiveSource[]> {
  const { data, error } = await getSupabaseServiceClient()
    .from("sources")
    .select("id, name, listing_url, parser_strategy, logo_url")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throwSupabaseError("Unable to load active sources", error);
  }

  return (data ?? []).map((source) => ({
    id: source.id,
    name: source.name,
    listingUrl: source.listing_url,
    parserStrategy: source.parser_strategy,
    logoUrl: source.logo_url,
  }));
}

export async function getSourceById(sourceId: number): Promise<ActiveSource | null> {
  const { data, error } = await getSupabaseServiceClient()
    .from("sources")
    .select("id, name, listing_url, parser_strategy, logo_url")
    .eq("id", sourceId)
    .maybeSingle();

  if (error) {
    throwSupabaseError(`Unable to load source ${sourceId}`, error);
  }

  return data
    ? {
        id: data.id,
        name: data.name,
        listingUrl: data.listing_url,
        parserStrategy: data.parser_strategy,
        logoUrl: data.logo_url,
      }
    : null;
}
