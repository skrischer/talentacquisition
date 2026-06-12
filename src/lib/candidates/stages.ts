// The sole home for the board's stage configuration (constitution principle 2:
// stages are a fixed enum in app-level config, never a DB stage-config table).
// Components and queries import from here; they never redefine the ordered list
// or the terminal-stage set.

import { Constants, type Enums } from "@/lib/supabase/types";

export type PipelineStage = Enums<"pipeline_stage">;

// Pipeline order is the Phase 2 enum definition order, preserved by the
// generated Constants tuple (new -> screening -> ... -> hired).
export const PIPELINE_STAGES: readonly PipelineStage[] =
  Constants.public.Enums.pipeline_stage;

// Terminal stage(s): the positive end of the pipeline. App-level flag, not a DB
// or status value (Phase 2 design).
export const TERMINAL_STAGES: readonly PipelineStage[] = ["hired"];
