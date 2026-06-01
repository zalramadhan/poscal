// ──────────────────────────────────────────────────────
// POS AI - Database Push Script (for Vercel build)
// ──────────────────────────────────────────────────────
// Uses direct connection for Prisma schema push
// ──────────────────────────────────────────────────────

const { execSync } = require("child_process");

function getDirectUrl(poolerUrl) {
  try {
    const url = new URL(poolerUrl);
    if (url.port === "6543") {
      url.port = "5432";
    }
    const params = new URLSearchParams(url.search);
    params.delete("pgbouncer");
    url.search = params.toString();
    return url.toString();
  } catch {
    return poolerUrl.replace(":6543/", ":5432/").replace(/[?&]pgbouncer=true/g, "");
  }
}

const originalUrl = process.env.DATABASE_URL;

if (!originalUrl) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

// Only transform if it looks like a pooler URL
if (originalUrl.includes(":6543") || originalUrl.includes("pgbouncer")) {
  const directUrl = getDirectUrl(originalUrl);
  process.env.DATABASE_URL = directUrl;
  console.log("🔧 Using direct database connection (bypassing pooler)");
}

execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });