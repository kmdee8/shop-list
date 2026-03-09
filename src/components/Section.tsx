"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SectionProps {
  readonly title: string;
  readonly count: number;
  readonly defaultOpen?: boolean;
  readonly children: React.ReactNode;
}

export default function Section({
  title,
  count,
  defaultOpen = false,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 rounded-xl border border-purple-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-purple-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 text-purple-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-purple-400" />
          )}
          <span className="font-semibold text-black">{title}</span>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-500">
            {count}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-purple-100">
          {count === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-purple-300">
              {title === "Done"
                ? "Nothing done yet."
                : "Nothing here yet — add an item above! 🛒"}
            </p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}
