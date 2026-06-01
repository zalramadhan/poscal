// ──────────────────────────────────────────────────────
// POS AI - Database Push Script (for Vercel build)
// ──────────────────────────────────────────────────────
// Transforms Supabase pooler connection to direct connection
// for prisma db push, because the schema engine doesn't
// work with PgBouncer (prepared statement conflict).
// ──────────────────────────────────────────────────────

const { execSync } = require("child_process");

function getDirectUrl(poolerUrl) {
  try {
    const url = new URL(poolerUrl);

    // Change port from pooler (6543) to direct (5432)
    if (url.port === "6543") {
      url.port = "5432";
    }

    // Remove pgbouncer query parameter
    const params = new URLSearchParams(url.search);
    params.delete("pgbouncer");
    url.search = params.toString();

    return url.toString();
  } catch {
    // Fallback: simple string replacement
    return poolerUrl
      .replace(":6543/", ":5432/")
      .replace(/[?&]pgbouncer=true/g, "");
  }
}

const originalUrl = process.env.DATABASE_URL;

if (!originalUrl) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const directUrl = getDirectUrl(originalUrl);
process.env.DATABASE_URL = directUrl;

console.log("🔧 Running prisma db push with direct connection...");
execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
