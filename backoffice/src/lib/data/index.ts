import { events, members, publishes, tasks } from "./mock";
import type { AppData } from "./types";

// The only data entry point for the screens. Connecting Notion / Google Calendar
// means replacing these bodies with /api calls.

export async function getMembers() {
  return members;
}

export async function loadData(): Promise<AppData> {
  return { members, tasks, publishes, events };
}
