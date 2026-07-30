import mcqData from "@/data/mcq.json";
import { CATEGORIES } from "@/lib/cards";
import type { McqRichText } from "@/lib/mcqRichText";

export interface McqOption {
  key: string;
  text: McqRichText;
}

export interface McqQuestion {
  id: string;
  domain: string;
  category: string;
  scenario: McqRichText;
  options: McqOption[];
  correctKey: string;
  explanation: {
    correct: McqRichText;
    incorrect: Record<string, McqRichText>;
  };
}

// The dataset's own order is the canonical, stable question sequence within
// each category -- every question's permalink (/mcq/[category]/[id]) and its
// Previous/Next neighbors come from its fixed position here, not from any
// session-local ordering.
export const questions = mcqData as unknown as McqQuestion[];

const INDEX_BY_ID = new Map(questions.map((q, index) => [q.id, index]));

export function getQuestionIndex(id: string): number | undefined {
  return INDEX_BY_ID.get(id);
}

export function getQuestionById(id: string): McqQuestion | undefined {
  const index = INDEX_BY_ID.get(id);
  return index === undefined ? undefined : questions[index];
}

// Mirrors flashcards' CATEGORIES list/order, but only the categories that
// actually have at least one MCQ question -- several flashcard categories
// (e.g. machine-learning, end-user-computing) have no MCQ coverage yet, and
// a section with nothing in it isn't worth listing.
export const MCQ_CATEGORIES = CATEGORIES.map((c) => ({
  slug: c.slug,
  title: c.title,
  questions: questions.filter((q) => q.category === c.slug),
})).filter((c) => c.questions.length > 0);

const MCQ_CATEGORY_BY_SLUG = new Map(MCQ_CATEGORIES.map((c) => [c.slug, c]));

export function getMcqCategory(slug: string) {
  return MCQ_CATEGORY_BY_SLUG.get(slug);
}
