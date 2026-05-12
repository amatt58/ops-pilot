import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "OpsPilot",
  description: "AI-augmented operations platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
