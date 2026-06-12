"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

// The global header search: a small form that routes to the candidate list
// filtered by the query (/candidates?q=…). The list reads `q` as its initial
// search value; an empty query routes to the unfiltered list.
export function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/candidates?q=${encodeURIComponent(trimmed)}` : "/candidates",
    );
  }

  return (
    <form role="search" onSubmit={submit} className="w-full max-w-md">
      <Input
        type="search"
        name="q"
        icon={Search}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Bewerber suchen …"
        aria-label="Bewerber suchen"
      />
    </form>
  );
}
