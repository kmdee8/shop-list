import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/items — fetch all items ordered by position then createdAt
export async function GET() {
  const items = await prisma.item.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(items);
}

// POST /api/items — create a new item
export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Place new items at the top (position 0), shift others down
  await prisma.item.updateMany({
    where: { done: false },
    data: { position: { increment: 1 } },
  });

  const item = await prisma.item.create({
    data: { name: name.trim(), position: 0 },
  });

  return NextResponse.json(item, { status: 201 });
}

