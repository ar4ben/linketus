import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function resolveBuildVersion() {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_VERSION ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_DEPLOYMENT_ID;

  if (fromEnv) {
    return fromEnv;
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev";
  }

  try {
    const buildId = await readFile(path.join(process.cwd(), ".next", "BUILD_ID"), "utf8");
    return buildId.trim();
  } catch {
    return "prod-unknown";
  }
}

export async function GET() {
  const version = await resolveBuildVersion();

  return NextResponse.json(
    { version },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
