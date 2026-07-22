import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <h1 className="mb-1 text-xl font-semibold text-foreground">SAP-C02 Study</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Pick how you want to study for the AWS Certified Solutions Architect – Professional
          exam.
        </p>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <Link
              href="/flashcards"
              className="text-base font-medium text-foreground hover:underline"
            >
              Anki Flashcards →
            </Link>
            <Separator />
            <Link href="/mcq" className="text-base font-medium text-foreground hover:underline">
              MCQ Practice →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
