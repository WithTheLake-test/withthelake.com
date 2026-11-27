// External addresses; "#" until Notion and Google Calendar are connected.
export const NOTION_TASKS_URL = "#";
export const GOOGLE_CALENDAR_URL = "#";
// Notion home, where the 공동 주간목표 table is filled in.
export const NOTION_HOME_URL = "https://app.notion.com/p/379414e3663180dcb5efd560c4c6ce3d";
// 💳 구독·정기결제 DB, where subscriptions and their billing dates are kept.
export const NOTION_PAYMENTS_URL = "https://app.notion.com/p/425414e3663181b8b92fe807ae283756";

// Homepage this repository deploys; site images (/assets, /uploads) are loaded from here.
export const HOMEPAGE_URL = "https://withthelake-test.pages.dev";

// "/uploads/a.jpg" → homepage address; data: and full URLs stay as they are.
export const homepageAsset = (src: string) => (src.startsWith("/") ? `${HOMEPAGE_URL}${src}` : src);
