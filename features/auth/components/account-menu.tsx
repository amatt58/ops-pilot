import { logoutAction } from "@/features/auth/actions/logout";
import { auth } from "@/server/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

export async function AccountMenu() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <span className="text-sm font-medium text-foreground">{session.user.name}</span>
      <div className="flex items-center gap-3">
        <Badge variant="secondary">{session.user.role}</Badge>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
