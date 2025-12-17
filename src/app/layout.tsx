import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ACES File Manager",
  description: "ACES XML generator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
