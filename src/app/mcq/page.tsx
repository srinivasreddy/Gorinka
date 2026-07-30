import { redirect } from "next/navigation";
import { questions } from "@/lib/mcqQuestions";

export default function McqIndexPage() {
  redirect(`/mcq/${questions[0].id}`);
}
