import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/shared/components/providers";
import "@/app/globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "OpsPilot",
  description: "AI-augmented operations platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
