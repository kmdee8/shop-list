import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import ShoppingList from "@/components/ShoppingList";
import { ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await prisma.item.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-purple-50 to-purple-100">
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-400 to-purple-600 shadow-sm">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-purple-900">Shopping List</h1>
            <p className="text-xs text-purple-400">Track what you need to buy</p>
          </div>
        </div>

        <ShoppingList
          initialItems={items.map((item: Prisma.ItemGetPayload<object>) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
