"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { questions } from "@/lib/mcqQuestions";

interface McqSessionValue {
  // questionId -> the option key the user picked. A question with no entry
  // here simply hasn't been answered yet -- there's no separate "skipped"
  // state, since Previous/Next/permalinks already let you reach any question
  // at any time.
  answers: Record<string, string>;
  answer: (questionId: string, key: string) => void;
  resetSession: () => void;
}

const McqSessionContext = createContext<McqSessionValue | null>(null);

// Lives in a layout above every /mcq/[id] page so answers survive
// Previous/Next navigation between them -- the standard App Router pattern
// for state shared across sibling routes under the same segment.
export function McqSessionProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const value = useMemo<McqSessionValue>(
    () => ({
      answers,
      answer: (questionId, key) =>
        setAnswers((prev) => (prev[questionId] ? prev : { ...prev, [questionId]: key })),
      resetSession: () => setAnswers({}),
    }),
    [answers]
  );

  return <McqSessionContext.Provider value={value}>{children}</McqSessionContext.Provider>;
}

export function useMcqSession() {
  const context = useContext(McqSessionContext);
  if (!context) throw new Error("useMcqSession must be used within McqSessionProvider");
  return context;
}

export function useMcqScore() {
  const { answers } = useMcqSession();
  return useMemo(() => {
    let score = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctKey) score++;
    }
    return { score, answeredCount: Object.keys(answers).length, total: questions.length };
  }, [answers]);
}
