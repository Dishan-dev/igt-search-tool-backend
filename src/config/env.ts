import dotenv from "dotenv";

dotenv.config();

// Ensure critical variables are present
if (!process.env.EXPA_TOKEN) {
  console.error("❌ CRITICAL ERROR: EXPA_TOKEN environment variable is missing.");
  console.error("Please add it to your .env file before starting the server.");
  process.exit(1);
}

if (!process.env.EXPA_GRAPHQL_URL) {
  console.error("❌ CRITICAL ERROR: EXPA_GRAPHQL_URL environment variable is missing.");
  process.exit(1);
}

export const env = {
  PORT: process.env.PORT || 3000,
  EXPA_GRAPHQL_URL: process.env.EXPA_GRAPHQL_URL,
  EXPA_TOKEN: process.env.EXPA_TOKEN,
  COLOMBO_SOUTH_COMMITTEE_ID: process.env.COLOMBO_SOUTH_COMMITTEE_ID || "",
  FRONTEND_ORIGINS:
    process.env.FRONTEND_ORIGINS ||
    "https://igt-search-tool.vercel.app,http://localhost:5173,http://localhost:3000",
  GOOGLE_SHEET_CSV_URL: process.env.GOOGLE_SHEET_CSV_URL || "",
  GOOGLE_SHEET_SYNC_TTL_MS: Number(process.env.GOOGLE_SHEET_SYNC_TTL_MS || 60000),
  OPPORTUNITIES_CACHE_TTL_MS: Number(process.env.OPPORTUNITIES_CACHE_TTL_MS || 30000),
};
