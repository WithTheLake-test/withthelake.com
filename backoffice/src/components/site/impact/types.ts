import type { FieldDef } from "@/lib/site/impact-schema";

export type Item = Record<string, unknown>;

// What the right-hand panel edits; the impact screen shows one panel at a time.
export type PanelRequest = {
  title: string;
  fields: FieldDef[];
  initial: Item;
  onApply: (item: Item) => void;
  onDelete?: () => void;
};
