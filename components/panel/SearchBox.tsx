"use client";

import { useMemo, useState, type ReactNode } from "react";

export function SearchBox<T>({
  items,
  predicate,
  placeholder,
  children,
}: {
  items: T[];
  predicate: (item: T, query: string) => boolean;
  placeholder: string;
  children: (items: T[]) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => items.filter((item) => predicate(item, query.trim().toLowerCase())),
    [items, predicate, query],
  );

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#d7e6d3] bg-[#f7faf5] px-4 py-3 text-sm outline-none focus:border-[#4f7a58]"
      />
      {children(filtered)}
    </div>
  );
}
