"use client";

import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Card } from "@/lib/cards";

interface CardSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: Card[];
}

export function CardSearch({ query, onQueryChange, results }: CardSearchProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

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

          {results.map((card) => {
            const isExpanded = expanded === card.front;
            return (
              <div
                key={card.front}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : card.front)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50"
                >
                  <span dangerouslySetInnerHTML={{ __html: card.front }} />
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && (
                  <p
                    className="border-t px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: card.back }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
