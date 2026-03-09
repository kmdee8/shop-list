import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/suggestions?q=<query> — return up to 8 matching grocery inventory items
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) {
    return NextResponse.json([]);
  }

  const suggestions = await prisma.groceryInventory.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
    orderBy: { name: "asc" },
    take: 8,
    select: { id: true, name: true, category: true },
  });

  return NextResponse.json(suggestions);
}

