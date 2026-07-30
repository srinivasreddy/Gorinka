import mcqData from "@/data/mcq.json";
import type { McqRichText } from "@/lib/mcqRichText";

export interface McqOption {
  key: string;
  text: McqRichText;
}

export interface McqQuestion {
  id: string;
  domain: string;
  scenario: McqRichText;
  options: McqOption[];
  correctKey: string;
  explanation: {
    correct: McqRichText;
    incorrect: Record<string, McqRichText>;
  };
}

// The dataset's own order is the canonical, stable question sequence --
// every question's permalink (/mcq/[id]) and its Previous/Next neighbors are
// defined by its fixed position here, not by any session-local ordering.
export const questions = mcqData as unknown as McqQuestion[];

const INDEX_BY_ID = new Map(questions.map((q, index) => [q.id, index]));

export function getQuestionIndex(id: string): number | undefined {
  return INDEX_BY_ID.get(id);
}

export function getQuestionById(id: string): McqQuestion | undefined {
  const index = INDEX_BY_ID.get(id);
  return index === undefined ? undefined : questions[index];
}
