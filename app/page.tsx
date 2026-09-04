import { AccountMenu } from "@/features/auth/components/account-menu";
import { Button } from "@/shared/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AccountMenu />
      <main className="p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome to OpsPilot</h1>
        <p className="text-sm text-muted-foreground mb-4">AI-augmented operations platform</p>
        <Button>Get Started</Button>
      </main>
    </div>
  );
}
