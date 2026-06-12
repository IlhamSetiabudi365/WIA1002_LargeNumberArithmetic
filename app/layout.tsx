import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// Metadata used by Next.js for the browser title and page description.
export const metadata: Metadata = {
  title: "DigiTrace",
  description: "Interactive visualizer for large number arithmetic with doubly linked lists."
};

/**
 * Root HTML shell shared by every page in the Next.js app.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
