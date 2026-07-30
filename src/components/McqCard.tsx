"use client";

import { Fragment } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface RichTextProps {
  segments: McqRichText;
  // Options can be nothing but a single linked term, and a native <button>
  // can't contain a nested <a> anyway -- so terms there render as inert,
  // underlined text rather than links. Scenario and explanation text aren't
  // inside any clickable control, so their terms link out for real.
  linkable: boolean;
}

function RichText({ segments, linkable }: RichTextProps) {
  return (
    <>
      {resolveRichText(segments, linkable).map((piece, index) => {
        switch (piece.type) {
          case "text":
            return <Fragment key={index}>{piece.value}</Fragment>;
          case "term":
            return (
              <span key={index} data-card-term>
                {piece.text}
              </span>
            );
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

const LINK_STYLES =
  "[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-dotted hover:[&_a]:text-primary";
const TERM_STYLES =
  "[&_[data-card-term]]:underline [&_[data-card-term]]:underline-offset-2 [&_[data-card-term]]:decoration-dotted";

export function McqCard({
  question,
  selectedKey,
  isAnswered,
  isRevisit,
  canSkip,
  onSelect,
  onSkip,
}: McqCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary">{question.domain}</Badge>
            {isRevisit && <Badge variant="outline">Skipped earlier</Badge>}
          </div>
          <p className={cn("whitespace-pre-line text-base leading-relaxed text-foreground", LINK_STYLES)}>
            <RichText segments={question.scenario} linkable />
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {question.options.map((option) => {
            const isCorrectOption = option.key === question.correctKey;
            const isSelectedOption = option.key === selectedKey;
            const showAsCorrect = isAnswered && isCorrectOption;
            const showAsIncorrect = isAnswered && isSelectedOption && !isCorrectOption;

            return (
              <Button
                key={option.key}
                data-testid="mcq-option"
                onClick={() => onSelect(option.key)}
                disabled={isAnswered}
                variant="outline"
                size="lg"
                className={cn(
                  "h-auto w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left text-sm font-normal disabled:opacity-100",
                  TERM_STYLES,
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
                  <RichText segments={option.text} linkable={false} />
                </span>
              </Button>
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
          <div className={cn("flex flex-col gap-4 border-t pt-4", LINK_STYLES)}>
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
                <RichText segments={question.explanation.correct} linkable />
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-foreground">Why the others are wrong</p>
              <ul className="flex flex-col gap-2">
                {Object.entries(question.explanation.incorrect).map(([key, reason]) => (
                  <li key={key} className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">{key}: </span>
                    <RichText segments={reason} linkable />
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
