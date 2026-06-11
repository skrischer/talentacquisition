// Placeholder schema types for the typed Supabase clients. The candidate schema
// does not exist yet (Phase 2 — Data model), so this is an empty `public` schema.
// TODO(types): replace with generated output once Phase 2 migrations land —
// `supabase gen types typescript --project-id nlhpxtrpddjnnqgxwqle`.
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
