import type { Metadata } from "next";
import "./globals.css";
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Lebanese Driving Test Practice",
  description: "Practice for your Lebanese driving license computer test",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="aebfc48a-7794-41ff-a106-ed88beb8900a"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
