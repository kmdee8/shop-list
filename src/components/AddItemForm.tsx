"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";

interface Suggestion {
  id: number;
  name: string;
  category: string;
}

interface AddItemFormProps {
  readonly onAdd: (name: string) => Promise<void>;
  readonly inventory: Suggestion[];
}

export default function AddItemForm({ onAdd, inventory }: Readonly<AddItemFormProps>) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filterSuggestions = useCallback((query: string) => {
    if (query.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = query.trim().toLowerCase();
    const filtered = inventory
      .filter((item) => item.name.toLowerCase().includes(q))
      .slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setActiveIndex(-1);
  }, [inventory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => filterSuggestions(value), 180);
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    setName(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setShowSuggestions(false);
    setLoading(true);
    try {
      await onAdd(trimmed);
      setName("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative mb-5">
      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Add an item…"
          disabled={loading}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
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

      {showSuggestions && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-xl shadow-purple-100/60"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => selectSuggestion(s)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-[14px] transition-colors ${
                i === activeIndex
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-700 hover:bg-purple-50/60"
              }`}
            >
              <span className="font-medium">{s.name}</span>
              <span className="ml-3 text-[12px] text-purple-300">{s.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
