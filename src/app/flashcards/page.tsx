import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/cards";

export default function FlashcardsIndexPage() {
  const totalCards = CATEGORIES.reduce((sum, c) => sum + c.cards.length, 0);

  return (
    <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <h1 className="mb-1 text-xl font-semibold text-foreground">SAP-C02 Flashcards</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {totalCards} cards across {CATEGORIES.length} categories — pick one to study.
        </p>

        <div className="flex flex-col gap-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/flashcards/${category.slug}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50"
            >
              <span className="text-sm font-medium text-foreground">{category.title}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {category.cards.length} cards
                <ChevronRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
