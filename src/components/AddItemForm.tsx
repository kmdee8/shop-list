"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";

interface AddItemFormProps {
  readonly onAdd: (name: string) => Promise<void>;
}

export default function AddItemForm({ onAdd }: Readonly<AddItemFormProps>) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await onAdd(trimmed);
      setName("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 mb-5">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add an item…"
        disabled={loading}
        className="flex-1 rounded-2xl border border-purple-200 glass px-4 py-3 text-[15px] font-medium text-black placeholder:text-purple-300 placeholder:font-normal shadow-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200/60 disabled:opacity-50 transition-all duration-200"
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="spring flex items-center gap-1.5 rounded-2xl bg-purple-500 px-5 py-3 text-[15px] font-semibold text-white shadow-md shadow-purple-200 hover:bg-purple-600 active:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Add
      </button>
    </form>
  );
}
