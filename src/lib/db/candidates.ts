// Typed candidate data-access on the RLS-scoped server Supabase client
// (constitution principle 6: no service-role key, all access server-side).
// Built on the Phase 2 generated `Database` type, so the row/insert/update
// shapes track the schema. Reads are RSC server components, writes are server
// actions — both call these functions on the per-request server client.

import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type Candidate = Tables<"candidate">;
export type CandidateInsert = TablesInsert<"candidate">;
export type CandidateUpdate = TablesUpdate<"candidate">;

// All rows, newest first. No pagination in the MVP — a single-team dataset
// small enough to filter and sort client-side (see the list page).
export async function list(): Promise<Candidate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getById(id: string): Promise<Candidate | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Insert a new candidate. The five defaulted-NOT-NULL enum columns
// (foreign_qualification_recognition, mobility, stage, status,
// team_feedback_status) are optional in `CandidateInsert` and never typed as
// `null`; when the caller omits them the database default applies. A `key:
// undefined` is dropped on the wire, so an unset optional column likewise falls
// back to its default rather than overwriting it with null.
export async function create(input: CandidateInsert): Promise<Candidate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function update(
  id: string,
  input: CandidateUpdate,
): Promise<Candidate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
