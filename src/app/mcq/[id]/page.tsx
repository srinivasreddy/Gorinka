"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { McqCard } from "@/components/McqCard";
import { CardNavControls } from "@/components/CardNavControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { questions, getQuestionIndex } from "@/lib/mcqQuestions";
import { useMcqSession, useMcqScore } from "@/lib/McqSessionContext";
import { isTypingTarget } from "@/lib/isTypingTarget";

const OPTION_KEYS = ["1", "2", "3", "4"];

export default function McqQuestionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { answers, answer, resetSession } = useMcqSession();
  const { score, answeredCount, total } = useMcqScore();

  const index = getQuestionIndex(params.id);
  const question = index !== undefined ? questions[index] : undefined;
  const selectedKey = question ? (answers[question.id] ?? null) : null;
  const isAnswered = selectedKey !== null;

  const prevId = index !== undefined && index > 0 ? questions[index - 1].id : undefined;
  const nextId =
    index !== undefined && index < questions.length - 1 ? questions[index + 1].id : undefined;

  function goToPrev() {
    if (prevId) router.push(`/mcq/${prevId}`);
  }

  function goToNext() {
    if (nextId) router.push(`/mcq/${nextId}`);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || !question) return;
      if (isTypingTarget(event)) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrev();
        return;
      }
      if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter") {
        event.preventDefault();
        goToNext();
        return;
      }
      if (!isAnswered) {
        const optionIndex = OPTION_KEYS.indexOf(event.key);
        const option = question.options[optionIndex];
        if (option) {
          event.preventDefault();
          answer(question.id, option.key);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, isAnswered, prevId, nextId, answer]);

  if (!question) {
    return (
      <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
        <div className="w-full max-w-xl">
          <h1 className="mb-1 text-xl font-semibold text-foreground">SAP-C02 MCQ Practice</h1>
          <Card className="mt-6">
            <CardContent className="text-center">
              <p className="font-medium text-foreground">Question not found.</p>
              <Link href="/mcq" className="mt-2 inline-block text-sm text-primary underline">
                Start from the beginning
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">SAP-C02 MCQ Practice</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              if (window.confirm("Restart the whole session? This clears every answer so far.")) {
                resetSession();
              }
            }}
          >
            <RotateCcw />
            Restart
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {index! + 1} of {total} · {answeredCount} answered
            </span>
            <span>{score} correct</span>
          </div>
          <Progress value={(answeredCount / total) * 100} />
        </div>

        <McqCard
          question={question}
          selectedKey={selectedKey}
          isAnswered={isAnswered}
          onSelect={(key) => answer(question.id, key)}
        />

        <div className="mt-2 flex flex-col items-center gap-1">
          <CardNavControls
            canGoBack={prevId !== undefined}
            canGoForward={nextId !== undefined}
            onBack={goToPrev}
            onForward={goToNext}
          />
          <p className="text-xs text-muted-foreground opacity-60">← previous · next →</p>
        </div>
      </div>
    </div>
  );
}
