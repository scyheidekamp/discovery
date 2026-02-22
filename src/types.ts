export type Status = "open" | "todo" | "in_progress" | "paused" | "testing" | "done";

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Idea {
  projectId: string;
  id: string;
  title: string;
  description: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;        // hours
  riceScore: number;
  status: Status;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = "table" | "kanban";
export type SortMode = "auto" | "manual";

export const STATUS_LIST: Status[] = [
  "open",
  "todo",
  "in_progress",
  "paused",
  "testing",
  "done",
];

export const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  open: { label: "Open", color: "var(--color-open)" },
  todo: { label: "To-do", color: "var(--color-todo)" },
  in_progress: { label: "In Progress", color: "var(--color-in-progress)" },
  paused: { label: "Paused", color: "var(--color-paused)" },
  testing: { label: "Testing", color: "var(--color-testing)" },
  done: { label: "Done", color: "var(--color-done)" },
};

export const IMPACT_OPTIONS = [
  { value: 0.25, label: "Minimal (0.25x)" },
  { value: 0.5, label: "Low (0.5x)" },
  { value: 1, label: "Medium (1x)" },
  { value: 2, label: "High (2x)" },
  { value: 3, label: "Massive (3x)" },
];
