import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hedgehog Mode - The Game",
  description: "Hedgehog Mode is a game where you can play with hedgehogs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
