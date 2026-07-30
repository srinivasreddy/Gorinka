import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MCQ_CATEGORIES, questions } from "@/lib/mcqQuestions";

export default function McqIndexPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <h1 className="mb-1 text-xl font-semibold text-foreground">SAP-C02 MCQ Practice</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {questions.length} questions across {MCQ_CATEGORIES.length} sections — pick one to
          practice.
        </p>

        <div className="flex flex-col gap-2">
          {MCQ_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/mcq/${category.slug}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50"
            >
              <span className="text-sm font-medium text-foreground">{category.title}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {category.questions.length} questions
                <ChevronRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
