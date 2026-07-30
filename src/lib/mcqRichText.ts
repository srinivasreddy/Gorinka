import { findCardLocation } from "@/lib/cards";

// A run of MCQ scenario/option/explanation text is either plain prose or a
// term that links to a flashcard -- stored as structured data (not markup
// embedded in a string) so rendering it never involves parsing.
export type McqTextSegment = string | { term: string; front: string };
export type McqRichText = McqTextSegment[];

export type RenderablePiece =
  | { type: "text"; value: string }
  | { type: "term"; text: string }
  | { type: "link"; text: string; href: string };

// Resolves each segment to something a component can render directly, with
// no knowledge of routing or the card index required at the call site. Falls
// back to plain text only if the referenced card doesn't actually exist --
// every linked term is otherwise a real, clickable link, everywhere it
// appears (scenario, options, explanations alike).
export function resolveRichText(segments: McqRichText): RenderablePiece[] {
  return segments.map((segment) => {
    if (typeof segment === "string") return { type: "text", value: segment };

    const location = findCardLocation(segment.front);
    if (!location) return { type: "term", text: segment.term };

    return {
      type: "link",
      text: segment.term,
      href: `/flashcards/${location.categorySlug}?card=${encodeURIComponent(segment.front)}`,
    };
  });
}
