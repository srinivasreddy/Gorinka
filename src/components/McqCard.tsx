"use client";

import { Fragment } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resolveRichText, type McqRichText } from "@/lib/mcqRichText";
import { cn } from "@/lib/utils";
import type { McqQuestion } from "@/lib/useMcqQueue";

interface McqCardProps {
  question: McqQuestion;
  selectedKey: string | null;
  isAnswered: boolean;
  isRevisit: boolean;
  canSkip: boolean;
  onSelect: (key: string) => void;
  onSkip: () => void;
}

function RichText({ segments }: { segments: McqRichText }) {
  return (
    <>
      {resolveRichText(segments).map((piece, index) => {
        switch (piece.type) {
          case "text":
            return <Fragment key={index}>{piece.value}</Fragment>;
          case "term":
            return <Fragment key={index}>{piece.text}</Fragment>;
          case "link":
            return (
              <a key={index} href={piece.href} target="_blank" rel="noopener noreferrer">
                {piece.text}
              </a>
            );
        }
      })}
    </>
  );
}

// True whenever the click/keydown originated on (or inside) a linked term --
// lets those terms' native <a> behavior run untouched, while any other click
// in the row still selects the option. Standard nested-interactive-element
// handling: the anchor isn't intercepted or re-implemented, its parent
// container just declines to also treat the click as "select this option."
function isFromLink(event: { target: EventTarget | null }): boolean {
  return (event.target as HTMLElement).closest("a") !== null;
}

export function McqCard({
  question,
  selectedKey,
  isAnswered,
  isRevisit,
  canSkip,
  onSelect,
  onSkip,
}: McqCardProps) {
  function handleOptionClick(event: React.MouseEvent, key: string) {
    if (isFromLink(event) || isAnswered) return;
    onSelect(key);
  }

  function handleOptionKeyDown(event: React.KeyboardEvent, key: string) {
    if (isFromLink(event)) return; // let the focused link's own Enter activation run
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (isAnswered) return;
    onSelect(key);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-dotted hover:[&_a]:text-primary">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary">{question.domain}</Badge>
            {isRevisit && <Badge variant="outline">Skipped earlier</Badge>}
          </div>
          <p className="whitespace-pre-line text-base leading-relaxed text-foreground">
            <RichText segments={question.scenario} />
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {question.options.map((option) => {
            const isCorrectOption = option.key === question.correctKey;
            const isSelectedOption = option.key === selectedKey;
            const showAsCorrect = isAnswered && isCorrectOption;
            const showAsIncorrect = isAnswered && isSelectedOption && !isCorrectOption;

            return (
              // A div, not a <button>: option text can contain a real <a>
              // link to a flashcard, and a native <button> can never legally
              // contain interactive content. isFromLink() lets the link
              // navigate normally while keeping the rest of the row
              // selectable, same as any "card with an embedded link" UI.
              <div
                key={option.key}
                data-testid="mcq-option"
                role="button"
                tabIndex={isAnswered ? -1 : 0}
                aria-disabled={isAnswered}
                onClick={(event) => handleOptionClick(event, option.key)}
                onKeyDown={(event) => handleOptionKeyDown(event, option.key)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-auto w-full cursor-pointer justify-start gap-3 whitespace-normal px-4 py-3 text-left text-sm font-normal",
                  showAsCorrect &&
                    "border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
                  showAsIncorrect &&
                    "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
                  isAnswered && !showAsCorrect && !showAsIncorrect && "opacity-60"
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    showAsCorrect && "border-green-500 bg-green-500 text-white",
                    showAsIncorrect && "border-red-500 bg-red-500 text-white",
                    !showAsCorrect && !showAsIncorrect && "border-border text-muted-foreground"
                  )}
                >
                  {showAsCorrect ? (
                    <CheckCircle2 className="size-4" />
                  ) : showAsIncorrect ? (
                    <XCircle className="size-4" />
                  ) : (
                    option.key
                  )}
                </span>
                <span className="flex-1">
                  <RichText segments={option.text} />
                </span>
              </div>
            );
          })}
        </div>

        {!isAnswered && canSkip && (
          <Button
            onClick={onSkip}
            variant="ghost"
            size="sm"
            className="self-end text-muted-foreground"
          >
            Skip this question — answer it later{" "}
            <span className="opacity-60 font-normal">(S)</span>
          </Button>
        )}

        {isAnswered && (
          <div className="flex flex-col gap-4 border-t pt-4">
            <div
              className={cn(
                "flex items-start gap-2 rounded-lg p-3 text-sm",
                selectedKey === question.correctKey
                  ? "bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-200"
                  : "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200"
              )}
            >
              {selectedKey === question.correctKey ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0" />
              )}
              <span className="font-medium">
                {selectedKey === question.correctKey
                  ? "Correct!"
                  : `Not quite — the correct answer is ${question.correctKey}.`}
              </span>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-foreground">
                Why {question.correctKey} is correct
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <RichText segments={question.explanation.correct} />
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-foreground">Why the others are wrong</p>
              <ul className="flex flex-col gap-2">
                {Object.entries(question.explanation.incorrect).map(([key, reason]) => (
                  <li key={key} className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">{key}: </span>
                    <RichText segments={reason} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
