import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-[var(--color-bg-alt)] p-6"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-heading)] text-2xl text-[var(--color-primary)]">
            talentacquisition
          </CardTitle>
        </CardHeader>
        <CardContent className="text-[var(--color-text-secondary)]">
          Walking skeleton. Anmeldung und App-Shell folgen.
        </CardContent>
      </Card>
    </main>
  );
}
