import { Card, CardContent } from "@/components/ui/card";

export default function McqPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <h1 className="mb-6 text-xl font-semibold text-foreground">SAP-C02 MCQ Practice</h1>

        <Card>
          <CardContent className="text-center">
            <p className="font-medium text-foreground">Coming soon.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Multiple-choice practice questions aren&apos;t built yet — check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
