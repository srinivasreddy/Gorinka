import { notFound, redirect } from "next/navigation";
import { getMcqCategory } from "@/lib/mcqQuestions";

export default async function McqCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getMcqCategory(slug);
  if (!category) notFound();
  redirect(`/mcq/${slug}/${category.questions[0].id}`);
}
