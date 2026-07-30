"use client";

import { useState } from "react";
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

const questions = mcqData as unknown as McqQuestion[];

function initialQueue() {
  return questions.map((_, i) => i);
}

export function useMcqQueue() {
  const [queue, setQueue] = useState<number[]>(initialQueue);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const total = questions.length;
  const question = queue.length > 0 ? questions[queue[0]] : null;
  const isAnswered = selectedKey !== null;
  const isCorrect = isAnswered && selectedKey === question?.correctKey;
  const isComplete = queue.length === 0;
  const isLastQuestion = queue.length === 1;
  const canSkip = queue.length > 1;
  const isRevisit = question !== null && skippedIds.has(question.id);
  const skippedCount = skippedIds.size;

  function selectAnswer(key: string) {
    if (isAnswered || !question) return;
    setSelectedKey(key);
    if (key === question.correctKey) setScore((s) => s + 1);
  }

  function next() {
    if (queue.length === 0) return;
    const [currentIndex, ...rest] = queue;
    const currentId = questions[currentIndex].id;
    setQueue(rest);
    setAnsweredCount((c) => c + 1);
    setSelectedKey(null);
    if (skippedIds.has(currentId)) {
      setSkippedIds((prev) => {
        const next = new Set(prev);
        next.delete(currentId);
        return next;
      });
    }
  }

  function skip() {
    if (isAnswered || queue.length <= 1) return;
    const [currentIndex, ...rest] = queue;
    const currentId = questions[currentIndex].id;
    setQueue([...rest, currentIndex]);
    setSkippedIds((prev) => new Set(prev).add(currentId));
  }

  function restart() {
    setQueue(initialQueue());
    setSelectedKey(null);
    setScore(0);
    setAnsweredCount(0);
    setSkippedIds(new Set());
  }

  return {
    question,
    questionNumber: answeredCount + 1,
    total,
    score,
    selectedKey,
    isAnswered,
    isCorrect,
    isComplete,
    isLastQuestion,
    canSkip,
    isRevisit,
    skippedCount,
    selectAnswer,
    next,
    skip,
    restart,
  };
}
