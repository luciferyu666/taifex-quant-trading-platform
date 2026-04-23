import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taifex Quant Trading Platform",
  description: "Paper-first development dashboard for Taiwan futures quantitative trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
