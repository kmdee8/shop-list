"use client";

import { useState, useCallback } from "react";
import Section from "./Section";
import ItemRow, { Item } from "./ItemRow";
import AddItemForm from "./AddItemForm";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
}

interface ShoppingListProps {
  initialItems: Item[];
  inventory: InventoryItem[];
}

export default function ShoppingList({ initialItems, inventory }: ShoppingListProps) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  const setLoading = (id: number, value: boolean) => {
    setLoadingIds((prev) => {
      const next = new Set(prev);
      value ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleAdd = useCallback(async (name: string) => {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const newItem: Item = await res.json();
      setItems((prev) => [newItem, ...prev]);
    }
  }, []);

  const handleToggle = useCallback(async (id: number, done: boolean) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done } : item))
    );
    setLoading(id, true);

    const res = await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });

    if (!res.ok) {
      // Revert on error
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, done: !done } : item))
      );
    }

    setLoading(id, false);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    // Optimistic remove
    setItems((prev) => prev.filter((item) => item.id !== id));
    setLoading(id, true);

    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });

    if (!res.ok) {
      // Re-fetch to restore correct state on error
      const refetch = await fetch("/api/items");
      if (refetch.ok) setItems(await refetch.json());
    }

    setLoading(id, false);
  }, []);

  const toBuy = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  return (
    <div>
      <AddItemForm onAdd={handleAdd} inventory={inventory} />

      <Section title="To Buy" count={toBuy.length} defaultOpen={true}>
        <div>
          {toBuy.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              loading={loadingIds.has(item.id)}
            />
          ))}
        </div>
      </Section>

      <Section title="Done" count={done.length} defaultOpen={false}>
        <div>
          {done.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              loading={loadingIds.has(item.id)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
