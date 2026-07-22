"use client";

import { useState } from "react";
import mcqData from "@/data/mcq.json";

export interface McqOption {
  key: string;
  text: string;
}

export interface McqQuestion {
  id: string;
  domain: string;
  scenario: string;
  options: McqOption[];
  correctKey: string;
  explanation: {
    correct: string;
    incorrect: Record<string, string>;
  };
}

const questions = mcqData as unknown as McqQuestion[];

export function useMcqQueue() {
  const [index, setIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const total = questions.length;
  const question = questions[index] ?? null;
  const isAnswered = selectedKey !== null;
  const isCorrect = isAnswered && selectedKey === question?.correctKey;
  const isComplete = index >= total;
  const isLastQuestion = index === total - 1;

  function selectAnswer(key: string) {
    if (isAnswered || !question) return;
    setSelectedKey(key);
    if (key === question.correctKey) setScore((s) => s + 1);
  }

  function next() {
    setSelectedKey(null);
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setSelectedKey(null);
    setScore(0);
  }

  return {
    question,
    questionNumber: index + 1,
    total,
    score,
    selectedKey,
    isAnswered,
    isCorrect,
    isComplete,
    isLastQuestion,
    selectAnswer,
    next,
    restart,
  };
}
