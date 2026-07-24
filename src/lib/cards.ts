import analyticsCards from "@/data/cards/analytics.json";
import computeCards from "@/data/cards/compute.json";
import costManagementCards from "@/data/cards/cost-management.json";
import databaseCards from "@/data/cards/database.json";
import developerToolsCards from "@/data/cards/developer-tools.json";
import endUserComputingCards from "@/data/cards/end-user-computing.json";
import integrationCards from "@/data/cards/integration.json";
import iotCards from "@/data/cards/iot.json";
import machineLearningCards from "@/data/cards/machine-learning.json";
import managementCards from "@/data/cards/management.json";
import migrationCards from "@/data/cards/migration.json";
import networkingCards from "@/data/cards/networking.json";
import securityCards from "@/data/cards/security.json";
import storageCards from "@/data/cards/storage.json";

export interface Card {
  front: string;
  back: string;
}

export interface CardCategory {
  slug: string;
  title: string;
  cards: Card[];
}

function clean(cards: Card[]): Card[] {
  return cards.filter((card) => card.front.replace(/<[^>]*>/g, "").trim().length > 0);
}

export const CATEGORIES: CardCategory[] = [
  { slug: "compute", title: "Compute", cards: clean(computeCards) },
  { slug: "storage", title: "Storage", cards: clean(storageCards) },
  { slug: "database", title: "Database", cards: clean(databaseCards) },
  { slug: "networking", title: "Networking & Content Delivery", cards: clean(networkingCards) },
  { slug: "security", title: "Security, Identity & Compliance", cards: clean(securityCards) },
  { slug: "analytics", title: "Analytics", cards: clean(analyticsCards) },
  { slug: "machine-learning", title: "Machine Learning", cards: clean(machineLearningCards) },
  { slug: "integration", title: "Application Integration", cards: clean(integrationCards) },
  { slug: "management", title: "Management & Governance", cards: clean(managementCards) },
  { slug: "migration", title: "Migration & Transfer", cards: clean(migrationCards) },
  { slug: "developer-tools", title: "Developer Tools", cards: clean(developerToolsCards) },
  { slug: "iot", title: "Internet of Things", cards: clean(iotCards) },
  {
    slug: "end-user-computing",
    title: "End User Computing",
    cards: clean(endUserComputingCards),
  },
  { slug: "cost-management", title: "Cost Management", cards: clean(costManagementCards) },
];

const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): CardCategory | undefined {
  return CATEGORY_BY_SLUG.get(slug);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
