import Link from "next/link";
import { AccountMenu } from "@/features/auth/components/account-menu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AccountMenu />
      <div className="flex">
        <nav className="w-48 shrink-0 border-r p-4">
          <Link href="/tickets" className="text-sm font-medium text-foreground hover:underline">
            Tickets
          </Link>
        </nav>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
