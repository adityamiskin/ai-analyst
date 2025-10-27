import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Venture Vision",
  description:
    "Venture Vision is a platform for VC firms to analyze startup companies using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster richColors />
        <Analytics />
      </body>
    </html>
  );
}
