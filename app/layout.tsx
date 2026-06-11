import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://logbook-magang.buildwithjj.store"),
  title: {
    default: "Logbook Magang — 900 Jam Target Tracker",
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
        url: "https://res.cloudinary.com/douoytv3i/image/upload/v1781159689/app_po1ozn.png",
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
    images: ["https://res.cloudinary.com/douoytv3i/image/upload/v1781159689/app_po1ozn.png"],
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
