# Daftar TODO & Pekerjaan Tersisa (Pending Tasks)

Dokumen ini memuat daftar tugas dan pengembangan fitur yang belum diselesaikan atau memerlukan peningkatan lebih lanjut, khususnya sistem notifikasi pengingat harian serta kustomisasi profil pengguna untuk mendukung penggunaan multi-user secara penuh.

---

## 1. Refaktor Sistem Notifikasi Pengingat (Email Reminder)

Saat ini, modul notifikasi (`app/api/cron/reminder/route.ts`) masih menggunakan pendekatan single-user statis. Agar mendukung multi-user dengan benar, langkah-langkah berikut perlu diimplementasikan:

- [ ] **Scoping Kueri per Pengguna**:
  - Ubah logika pencarian dari memeriksa apakah ada *satu pun* aktivitas di database menjadi mengiterasi seluruh pengguna terdaftar (`User`).
  - Untuk setiap pengguna, periksa apakah mereka memiliki `LogEntry` pada hari berjalan.
- [ ] **Dinamisasi Alamat Penerima Email**:
  - Ganti pengiriman statis ke `EMAIL_TO` (dari `.env`) dengan mengirim langsung ke email masing-masing pengguna (`user.email`) yang belum mengisi logbook.
- [ ] **Setup API Key Resend Resmi**:
  - Daftarkan domain pengirim di akun Resend untuk menggantikan `onboarding@resend.dev` agar email dapat dikirim ke alamat email selain akun sandbox pemilik Resend.
  - Perbarui `RESEND_API_KEY` dan `EMAIL_FROM` di `.env` produksi.
- [ ] **Konfigurasi Trigger Cron Job**:
  - Hubungkan endpoint `/api/cron/reminder?secret=CRON_SECRET` ke scheduler otomatis (misalnya Vercel Cron Job, GitHub Actions Cron, atau EasyCron) agar terpanggil sekali sehari (misalnya setiap jam 18:00 atau 20:00 WIB).

---

## 2. Dinamisasi Target & Tanggal Magang per Pengguna

Saat ini target total 900 jam dan rentang waktu magang (20 Mei - 20 September 2026) masih di-hardcode di file utilitas global. Agar aplikasi dapat digunakan oleh siswa dari sekolah/instansi lain dengan target yang berbeda:

- [ ] **Pembaruan Schema Database (`prisma/schema.prisma`)**:
  - Tambahkan kolom berikut ke model `User`:
    ```prisma
    model User {
      // ... field lama ...
      targetHours     Float    @default(900.0)
      internshipStart DateTime @default("2026-05-20T00:00:00Z")
      internshipEnd   DateTime @default("2026-09-20T23:59:59Z")
    }
    ```
- [ ] **Penyesuaian Helper Tanggal (`utils/dateHelpers.ts`)**:
  - Ubah fungsi penghitungan agar menerima parameter tanggal mulai, tanggal selesai, dan target jam dari database daripada merujuk ke konstanta global.
- [ ] **Dinamisasi Halaman Dashboard**:
  - Ambil informasi target dan rentang tanggal milik pengguna yang sedang login di `app/page.tsx`, lalu kirimkan prop tersebut ke komponen `StatsCard` dan `WeeklyOverview`.

---

## 3. Halaman Profil & Pengaturan Pengguna (Settings Profile)

Untuk memudahkan pengguna dalam mengelola akun dan preferensi mereka sendiri:

- [ ] **Halaman/Modal Pengaturan (`app/settings/page.tsx` atau Modal)**:
  - Sediakan formulir untuk memperbarui nama lengkap, mengubah kata sandi, dan menyesuaikan target jam serta tanggal magang mereka.
- [ ] **Pengaturan Preferensi Notifikasi**:
  - Tambahkan opsi checkbox (misalnya `sendReminders` boolean di model `User`) agar pengguna dapat memilih untuk menonaktifkan atau mengaktifkan email pengingat harian ke email mereka.

---

## 4. Validasi Durasi Harian

- [ ] **Pencegahan Input Jam yang Tidak Valid**:
  - Tambahkan validasi pada `LogEntryForm` agar pengguna tidak bisa memasukkan waktu selesai yang mendahului waktu mulai (misalnya mulai 09:00, selesai 08:00) atau total jam yang melebihi batas wajar (misalnya >16 jam per hari).
