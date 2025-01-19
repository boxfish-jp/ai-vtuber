import type { instructionEvent } from "../event/event.js";

export type viewerMode = "talk" | "spotify";

export type fuguoMode = "cli" | "remineder";

export type mode = viewerMode | fuguoMode | instructionEvent["type"];
