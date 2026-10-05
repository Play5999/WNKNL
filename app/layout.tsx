import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WNKNL",
  description: "Wegi Number Kòrsou Nederland",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
