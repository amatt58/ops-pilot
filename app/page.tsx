import { Button } from "@/shared/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-2">OpsPilot</h1>
      <p className="text-sm text-muted-foreground mb-4">AI-augmented operations platform</p>
      <Button>Get Started</Button>
    </main>
  );
}
