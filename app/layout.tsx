import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://logbook-magang.buildwithjj.store"),
  title: {
    default: "Logbook Magang — 900 Jam Target Tracker",
    template: "%s | Logbook Magang"
  },
  description: "Aplikasi pencatatan aktivitas magang harian untuk melacak progress target 900 jam kerja secara akurat dan mudah.",
  keywords: [
    "logbook magang",
    "900 jam magang",
    "target jam kerja magang",
    "tracker magang harian",
    "weekly report magang",
    "jurnal harian magang",
    "internship tracker",
    "buildwithjj"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Logbook Magang — 900 Jam Target Tracker",
    description: "Catat aktivitas harian, pantau persentase pencapaian jam magang, dan ekspor laporan mingguan secara instan.",
    url: "https://logbook-magang.buildwithjj.store",
    siteName: "Logbook Magang",
    images: [
      {
        url: "/app.webp",
        width: 1200,
        height: 630,
        alt: "Logbook Magang Dashboard Preview"
      }
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logbook Magang — 900 Jam Target Tracker",
    description: "Catat aktivitas harian dan pantau progress target jam magang Anda secara real-time.",
    images: ["/app.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "google-site-verification-placeholder",
  }
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
