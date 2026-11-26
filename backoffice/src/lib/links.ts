// External addresses; "#" until Notion and Google Calendar are connected.
export const NOTION_TASKS_URL = "#";
export const GOOGLE_CALENDAR_URL = "#";

// Homepage this repository deploys; site images (/assets, /uploads) are loaded from here.
export const HOMEPAGE_URL = "https://withthelake-test.pages.dev";

// "/uploads/a.jpg" → homepage address; data: and full URLs stay as they are.
export const homepageAsset = (src: string) => (src.startsWith("/") ? `${HOMEPAGE_URL}${src}` : src);
