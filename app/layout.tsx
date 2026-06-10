import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logbook Magang — 900 Jam Target Tracker",
  description: "Aplikasi pencatatan aktivitas magang harian untuk melacak progress target 900 jam kerja dalam rentang 20 Mei - 20 September 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
