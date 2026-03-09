import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/items/[id] — toggle done status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = Number.parseInt(id, 10);
  if (Number.isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const { done } = body;

  const item = await prisma.item.update({
    where: { id: itemId },
    data: { done: Boolean(done) },
  });

  return NextResponse.json(item);
}

// DELETE /api/items/[id] — delete an item
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = Number.parseInt(id, 10);
  if (Number.isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.item.delete({ where: { id: itemId } });
  return new NextResponse(null, { status: 204 });
}
