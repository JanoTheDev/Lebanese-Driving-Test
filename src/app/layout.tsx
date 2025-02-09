import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lebanese Driving Test",
  description: "Official Lebanese Driving Questions Test",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
