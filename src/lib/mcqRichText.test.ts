import { describe, expect, it } from "vitest";
import { resolveRichText } from "@/lib/mcqRichText";

describe("resolveRichText", () => {
  it("passes plain strings through untouched", () => {
    expect(resolveRichText(["just text"], true)).toEqual([{ type: "text", value: "just text" }]);
  });

  it("resolves a linked term to its flashcard route when linkable", () => {
    const result = resolveRichText([{ term: "IAM role", front: "AWS IAM" }], true);
    expect(result).toEqual([
      { type: "link", text: "IAM role", href: "/flashcards/security?card=AWS%20IAM" },
    ]);
  });

  it("renders a linked term as inert text when not linkable", () => {
    const result = resolveRichText([{ term: "IAM role", front: "AWS IAM" }], false);
    expect(result).toEqual([{ type: "term", text: "IAM role" }]);
  });

  it("falls back to inert text if the referenced card doesn't exist", () => {
    const result = resolveRichText([{ term: "Nonexistent", front: "Not A Real Card" }], true);
    expect(result).toEqual([{ type: "term", text: "Nonexistent" }]);
  });

  it("preserves ordering across a mix of text and linked terms", () => {
    const result = resolveRichText(
      ["Start with ", { term: "IAM role", front: "AWS IAM" }, ", then continue."],
      true
    );
    expect(result).toEqual([
      { type: "text", value: "Start with " },
      { type: "link", text: "IAM role", href: "/flashcards/security?card=AWS%20IAM" },
      { type: "text", value: ", then continue." },
    ]);
  });
});
