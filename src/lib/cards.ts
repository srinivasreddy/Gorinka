import cardsData from "@/data/cards.json";

export interface Card {
  front: string;
  back: string;
}

export const cards: Card[] = (cardsData as Card[]).filter(
  (card) => card.front.replace(/<[^>]*>/g, "").trim().length > 0
);

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
