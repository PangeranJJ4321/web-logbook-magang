import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://logbook-magang.buildwithjj.store"),
  title: {
    default: "Logbook Magang — Jam Target Tracker",
    template: "%s | Logbook Magang"
  },
  description: "Aplikasi pencatatan aktivitas harian magang untuk mahasiswa, siswa SMK, dan peserta internship industri. Lacak progress jam kerja secara akurat dan mudah.",
  keywords: [
    "logbook magang",
    "logbook magang mahasiswa",
    "logbook magang SMK",
    "jurnal pkl mahasiswa",
    "catatan harian magang",
    "target jam kerja magang",
    "tracker magang harian",
    "weekly report magang",
    "internship tracker",
    "buildwithjj"
  ],
  authors: [{ name: "PangeranJJ4321" }],
  creator: "JJ",
  publisher: "Build with JJ",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Logbook Magang — Jam Target Tracker",
    description: "Aplikasi pencatatan aktivitas harian magang untuk mahasiswa, siswa SMK, dan peserta internship industri. Lacak progress jam kerja secara akurat dan mudah.",
    url: "https://logbook-magang.buildwithjj.store",
    siteName: "Logbook Magang",
    images: [
      {
        url: "https://logbook-magang.buildwithjj.store/app.webp",
        width: 1200,
        height: 550,
        alt: "Logbook Magang Dashboard Preview",
      },
      {
        url: "https://logbook-magang.buildwithjj.store/app2.png",
        width: 1200,
        height: 550,
        alt: "Logbook Magang Secondary Preview",
      }
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logbook Magang — Jam Target Tracker",
    description: "Aplikasi pencatatan aktivitas harian magang untuk mahasiswa, siswa SMK, dan peserta internship industri. Lacak progress jam kerja secara akurat dan mudah.",
    images: [
      "https://logbook-magang.buildwithjj.store/app.webp",
      "https://logbook-magang.buildwithjj.store/app2.png"
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "S6iuZwYODmaO0VqD5jaEYPcl9pw96K9oSzsG-w5zP70",
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
