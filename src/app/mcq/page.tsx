"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { McqCard } from "@/components/McqCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMcqQueue } from "@/lib/useMcqQueue";

const OPTION_KEYS = ["1", "2", "3", "4"];

export default function McqPage() {
  const {
    question,
    questionNumber,
    total,
    score,
    selectedKey,
    isAnswered,
    isComplete,
    isLastQuestion,
    selectAnswer,
    next,
    restart,
  } = useMcqQueue();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || !question) return;

      if (!isAnswered) {
        const index = OPTION_KEYS.indexOf(event.key);
        if (index !== -1 && question.options[index]) {
          event.preventDefault();
          selectAnswer(question.options[index].key);
        }
        return;
      }

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        next();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question, isAnswered, selectAnswer, next]);

  return (
    <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <h1 className="mb-1 text-xl font-semibold text-foreground">SAP-C02 MCQ Practice</h1>

        {!isComplete && question && (
          <>
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Question {questionNumber} of {total}
                </span>
                <span>{score} correct</span>
              </div>
              <Progress value={((questionNumber - 1) / total) * 100} />
            </div>

            <McqCard
              question={question}
              selectedKey={selectedKey}
              isAnswered={isAnswered}
              onSelect={selectAnswer}
            />

            {isAnswered && (
              <Button onClick={next} size="lg" className="mt-6 h-11 w-full">
                {isLastQuestion ? "See results" : "Next question"}{" "}
                <span className="opacity-60 font-normal">(Space)</span>
              </Button>
            )}
          </>
        )}

        {isComplete && (
          <Card>
            <CardContent className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {score} / {total} correct
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {score === total
                  ? "Perfect score — nice work."
                  : "Review the explanations above and try again to reinforce the tricky ones."}
              </p>
              <Button onClick={restart} variant="outline" className="mt-6">
                <RotateCcw />
                Restart
              </Button>
            </CardContent>
          </Card>
        )}

        {!question && !isComplete && (
          <Card>
            <CardContent className="text-center">
              <p className="font-medium text-foreground">No questions yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Check back later.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
