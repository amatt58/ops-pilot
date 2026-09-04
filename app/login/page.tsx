import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Sign in to OpsPilot</h1>
          <p className="text-sm text-muted-foreground">Use your agent credentials to continue.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
