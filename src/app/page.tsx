import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const LINKS = [
  { href: "/flashcards", label: "Anki Flashcards" },
  { href: "/mcq", label: "MCQ Practice" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <h1 className="mb-1 text-xl font-semibold text-foreground">SAP-C02 Study</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Pick how you want to study for the AWS Certified Solutions Architect – Professional
          exam.
        </p>

        <nav className="flex items-center">
          {LINKS.map((link, i) => (
            <div key={link.href} className="flex items-center">
              {i > 0 && <Separator orientation="vertical" className="mx-3 h-4" />}
              <Link
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
