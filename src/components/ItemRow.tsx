"use client";

import { Trash2 } from "lucide-react";

export interface Item {
  id: number;
  name: string;
  done: boolean;
  position: number;
  createdAt: string;
}

interface ItemRowProps {
  readonly item: Item;
  readonly onToggle: (id: number, done: boolean) => void;
  readonly onDelete: (id: number) => void;
  readonly loading: boolean;
}

export default function ItemRow({ item, onToggle, onDelete, loading }: ItemRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-50 last:border-b-0 group hover:bg-purple-50 transition-colors">
      <button
        disabled={loading}
        onClick={() => onToggle(item.id, !item.done)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          item.done
            ? "border-purple-500 bg-linear-to-br from-purple-400 to-purple-600"
            : "border-purple-200 hover:border-purple-400"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={item.done ? "Mark as not done" : "Mark as done"}
      >
        {item.done && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-sm ${
          item.done ? "line-through text-gray-400" : "text-black"
        }`}
      >
        {item.name}
      </span>

      <button
        onClick={() => onDelete(item.id)}
        disabled={loading}
        className="opacity-0 group-hover:opacity-100 text-purple-300 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Delete item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
