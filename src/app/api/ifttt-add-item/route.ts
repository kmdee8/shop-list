import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Helper: build a failure response
// ---------------------------------------------------------------------------
function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

// ---------------------------------------------------------------------------
// OPTIONS /api/ifttt-add-item — CORS pre-flight (needed by some IFTTT configs)
// ---------------------------------------------------------------------------
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}

// ---------------------------------------------------------------------------
// POST /api/ifttt-add-item
//
// Accepts:  { "item": "milk" }
// Auth:     ?key=SECRET  OR  x-api-key: SECRET  header
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();

  // ── 1. Authentication ────────────────────────────────────────────────────
  const expectedKey = process.env.IFTTT_API_KEY;
  if (!expectedKey) {
    console.error(`[IFTTT] ${timestamp} IFTTT_API_KEY env var is not set`);
    return fail("Server misconfiguration", 500);
  }

  const keyFromQuery = request.nextUrl.searchParams.get("key");
  const keyFromHeader = request.headers.get("x-api-key");
  const providedKey = keyFromQuery ?? keyFromHeader;

  let authMethod = "none";
  if (keyFromQuery) authMethod = "query-param";
  else if (keyFromHeader) authMethod = "header";

  console.log(
    `[IFTTT] ${timestamp} Incoming request — ` +
      `method: POST, ` +
      `ip: ${request.headers.get("x-forwarded-for") ?? "unknown"}, ` +
      `auth: ${authMethod}`
  );

  if (!providedKey || providedKey !== expectedKey) {
    console.warn(`[IFTTT] ${timestamp} Rejected — invalid or missing API key`);
    return fail("Unauthorized", 401);
  }

  // ── 2. Parse body ────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.warn(`[IFTTT] ${timestamp} Rejected — invalid JSON body`);
    return fail("Invalid JSON body", 400);
  }

  // ── 3. Validate input ────────────────────────────────────────────────────
  if (
    typeof body !== "object" ||
    body === null ||
    !("item" in body)
  ) {
    console.warn(`[IFTTT] ${timestamp} Rejected — missing "item" field`);
    return fail('"item" field is required', 400);
  }

  const rawItem = (body as Record<string, unknown>).item;

  if (typeof rawItem !== "string") {
    console.warn(`[IFTTT] ${timestamp} Rejected — "item" is not a string`);
    return fail('"item" must be a string', 400);
  }

  const itemName = rawItem.trim();

  if (itemName === "") {
    console.warn(`[IFTTT] ${timestamp} Rejected — "item" is empty after trim`);
    return fail('"item" must not be empty', 400);
  }

  // ── 4. Persist (same logic as POST /api/items) ───────────────────────────
  try {
    // Place new item at the top (position 0), shift existing undone items down
    await prisma.item.updateMany({
      where: { done: false },
      data: { position: { increment: 1 } },
    });

    await prisma.item.create({
      data: { name: itemName, position: 0 },
    });

    console.log(`[IFTTT] ${timestamp} Item added successfully: "${itemName}"`);

    return NextResponse.json(
      { success: true, item: itemName },
      {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error(`[IFTTT] ${timestamp} Database error:`, err);
    return fail("Internal server error", 500);
  }
}

