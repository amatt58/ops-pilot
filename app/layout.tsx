import type { Metadata } from "next";
import "@/app/globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/shared/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "OpsPilot",
  description: "AI-augmented operations platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
