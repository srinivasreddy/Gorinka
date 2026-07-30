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
import { getQuestionById, getMcqCategory } from "@/lib/mcqQuestions";
import { useMcqSession, useMcqScore } from "@/lib/McqSessionContext";
import { isTypingTarget } from "@/lib/isTypingTarget";

const OPTION_KEYS = ["1", "2", "3", "4"];

export default function McqQuestionPage() {
  const params = useParams<{ category: string; id: string }>();
  const router = useRouter();
  const { answers, answer, resetSession } = useMcqSession();
  const { score, answeredCount, total } = useMcqScore();

  const question = getQuestionById(params.id);
  const category = getMcqCategory(params.category);
  const categoryMismatch = question !== undefined && question.category !== params.category;

  // A question only ever belongs to one category -- if the URL's category
  // segment is wrong, send the browser to its actual permalink instead of
  // just failing.
  useEffect(() => {
    if (categoryMismatch) router.replace(`/mcq/${question!.category}/${question!.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryMismatch]);

  const categoryQuestions = category?.questions ?? [];
  const indexInCategory = question
    ? categoryQuestions.findIndex((q) => q.id === question.id)
    : -1;
  const prevQuestion = indexInCategory > 0 ? categoryQuestions[indexInCategory - 1] : undefined;
  const nextQuestion =
    indexInCategory !== -1 && indexInCategory < categoryQuestions.length - 1
      ? categoryQuestions[indexInCategory + 1]
      : undefined;

  const selectedKey = question ? (answers[question.id] ?? null) : null;
  const isAnswered = selectedKey !== null;

  function goToPrev() {
    if (prevQuestion) router.push(`/mcq/${prevQuestion.category}/${prevQuestion.id}`);
  }

  function goToNext() {
    if (nextQuestion) router.push(`/mcq/${nextQuestion.category}/${nextQuestion.id}`);
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
  }, [question, isAnswered, prevQuestion, nextQuestion, answer]);

  if (!question || !category || categoryMismatch) {
    return (
      <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
        <div className="w-full max-w-xl">
          <h1 className="mb-1 text-xl font-semibold text-foreground">SAP-C02 MCQ Practice</h1>
          <Card className="mt-6">
            <CardContent className="text-center">
              <p className="font-medium text-foreground">Question not found.</p>
              <Link href="/mcq" className="mt-2 inline-block text-sm text-primary underline">
                Back to sections
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
        <Link
          href="/mcq"
          className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← All sections
        </Link>

        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{category.title}</h1>
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
              Question {indexInCategory + 1} of {categoryQuestions.length} in this section
            </span>
            <span>
              {score}/{answeredCount} correct · {total} total
            </span>
          </div>
          <Progress value={((indexInCategory + 1) / categoryQuestions.length) * 100} />
        </div>

        <McqCard
          question={question}
          selectedKey={selectedKey}
          isAnswered={isAnswered}
          onSelect={(key) => answer(question.id, key)}
        />

        <div className="mt-2 flex flex-col items-center gap-1">
          <CardNavControls
            canGoBack={prevQuestion !== undefined}
            canGoForward={nextQuestion !== undefined}
            onBack={goToPrev}
            onForward={goToNext}
          />
          <p className="text-xs text-muted-foreground opacity-60">← previous · next →</p>
        </div>
      </div>
    </div>
  );
}
