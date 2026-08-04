import "server-only";

import { getSupabaseServiceClient } from "../client";
import { throwSupabaseError } from "../errors";
import type { Tables, TablesInsert, TablesUpdate } from "../types";

const DEFAULT_RUN_LIMIT = 100;
const MAX_RUN_LIMIT = 500;

export type SaveScheduleInput = Pick<
  TablesInsert<"oxylabs_schedules">,
  "source_id" | "oxylabs_schedule_id" | "state" | "last_synced_at" | "last_error"
>;

export type SaveScheduleRunInput = Pick<
  TablesInsert<"oxylabs_schedule_runs">,
  | "schedule_id"
  | "oxylabs_run_id"
  | "oxylabs_job_id"
  | "result_status"
  | "processing_status"
  | "summary"
  | "processed_at"
  | "error_message"
>;

export type UpdateScheduleRunInput = Pick<
  TablesUpdate<"oxylabs_schedule_runs">,
  "result_status" | "processing_status" | "summary" | "processed_at" | "error_message"
>;

export async function getSchedules(): Promise<Tables<"oxylabs_schedules">[]> {
  const { data, error } = await getSupabaseServiceClient()
    .from("oxylabs_schedules")
    .select("*")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throwSupabaseError("Unable to load Oxylabs schedules", error);
  }

  return data ?? [];
}

export async function saveSchedule(input: SaveScheduleInput): Promise<Tables<"oxylabs_schedules">> {
  const updatedAt = new Date().toISOString();
  const { data, error } = await getSupabaseServiceClient()
    .from("oxylabs_schedules")
    .upsert({ ...input, updated_at: updatedAt }, { onConflict: "source_id" })
    .select("*")
    .single();

  if (error) {
    throwSupabaseError(`Unable to save Oxylabs schedule ${input.oxylabs_schedule_id}`, error);
  }

  return data;
}

export async function getScheduleRuns(
  scheduleId?: number,
  limit = DEFAULT_RUN_LIMIT,
): Promise<Tables<"oxylabs_schedule_runs">[]> {
  const boundedLimit = clampInteger(limit, 1, MAX_RUN_LIMIT);
  let query = getSupabaseServiceClient()
    .from("oxylabs_schedule_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(boundedLimit);

  if (scheduleId !== undefined) {
    query = query.eq("schedule_id", scheduleId);
  }

  const { data, error } = await query;

  if (error) {
    throwSupabaseError("Unable to load Oxylabs schedule runs", error);
  }

  return data ?? [];
}

export async function saveScheduleRun(
  input: SaveScheduleRunInput,
): Promise<Tables<"oxylabs_schedule_runs">> {
  const { data, error } = await getSupabaseServiceClient()
    .from("oxylabs_schedule_runs")
    .upsert(
      { ...input, updated_at: new Date().toISOString() },
      { onConflict: "schedule_id,oxylabs_job_id" },
    )
    .select("*")
    .single();

  if (error) {
    throwSupabaseError(`Unable to save Oxylabs job ${input.oxylabs_job_id}`, error);
  }

  return data;
}

export async function updateScheduleRun(
  runId: number,
  input: UpdateScheduleRunInput,
): Promise<Tables<"oxylabs_schedule_runs">> {
  const { data, error } = await getSupabaseServiceClient()
    .from("oxylabs_schedule_runs")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", runId)
    .select("*")
    .single();

  if (error) {
    throwSupabaseError(`Unable to update Oxylabs schedule run ${runId}`, error);
  }

  return data;
}

function clampInteger(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(Math.trunc(value), minimum), maximum);
}
