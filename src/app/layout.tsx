import "./globals.css";

export const metadata = {
  title: "ACES File Manager",
  description: "ACES XML template generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
