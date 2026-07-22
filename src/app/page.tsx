export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl text-center">
        <h1 className="mb-1 text-xl font-semibold text-foreground">SAP-C02 Study</h1>
        <p className="text-sm text-muted-foreground">
          Pick Anki Flashcards or MCQ Practice from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
