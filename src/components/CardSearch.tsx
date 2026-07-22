"use client";

import { ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { stripHtml, type Card } from "@/lib/cards";

interface CardSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: Card[];
  onSelect: (card: Card) => void;
}

export function CardSearch({ query, onQueryChange, results, onSelect }: CardSearchProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search all cards…"
          className="h-10 pr-8 pl-8"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onQueryChange("")}
            className="absolute top-1/2 right-1 -translate-y-1/2"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {query.trim() && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {results.length === 0
              ? `No cards match "${query.trim()}"`
              : `${results.length} card${results.length === 1 ? "" : "s"} found`}
          </p>

          {results.map((card) => (
            <button
              key={card.front}
              onClick={() => onSelect(card)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left hover:bg-muted/50"
            >
              <span className="flex-1 min-w-0">
                <span
                  className="block text-sm font-medium text-foreground"
                  dangerouslySetInnerHTML={{ __html: card.front }}
                />
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {stripHtml(card.back)}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
