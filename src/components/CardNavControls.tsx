"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardNavControlsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}

const navButtonClass = cn(
  "group relative flex h-12 w-16 items-center justify-center rounded-full text-muted-foreground",
  "transition-colors duration-150 hover:bg-muted hover:text-foreground active:scale-90",
  "motion-reduce:active:scale-100",
  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:opacity-30 disabled:active:scale-100"
);

export function CardNavControls({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: CardNavControlsProps) {
  return (
    <div className="mt-4 flex justify-center">
      <div className="inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Previous card"
          className={navButtonClass}
        >
          <ArrowLeft className="size-5 transition-transform duration-150 group-hover:-translate-x-0.5 group-active:-translate-x-1 motion-reduce:group-hover:translate-x-0 motion-reduce:group-active:translate-x-0" />
        </button>
        <div className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />
        <button
          type="button"
          onClick={onForward}
          disabled={!canGoForward}
          aria-label="Next card"
          className={navButtonClass}
        >
          <ArrowRight className="size-5 transition-transform duration-150 group-hover:translate-x-0.5 group-active:translate-x-1 motion-reduce:group-hover:translate-x-0 motion-reduce:group-active:translate-x-0" />
        </button>
      </div>
    </div>
  );
}
