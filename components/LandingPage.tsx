'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Slanted Header & Hero Background Wrapper */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(189, 189, 72, 0.16) 0%, rgba(18, 24, 38, 0.95) 100%)',
        clipPath: 'polygon(0 0, 100% 0, 100% 86%, 0 100%)',
        paddingBottom: '120px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 1. Header Navigation */}
        <header style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>⏱️</span>
            <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              logbook<span style={{ color: 'var(--primary-hover)' }}>.buildwithjj</span>
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', textDecoration: 'none', transition: 'var(--transition-smooth)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              Fitur
            </a>
            <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', textDecoration: 'none', transition: 'var(--transition-smooth)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              Masuk
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Daftar Sekarang
            </Link>
          </nav>
        </header>

        {/* 2. Hero Section */}
        <section style={{
          backgroundColor: 'transparent',
          padding: '80px 20px 40px 20px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '900',
              lineHeight: '1.15',
              color: 'var(--text-primary)',
              letterSpacing: '-1px'
            }}>
              Scheduled execution of your <span style={{ color: 'var(--primary)' }}>magang activities.</span>
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              lineHeight: '1.6'
            }}>
              Just in time. Track daily tasks, calculate weekly targets, and build your internship profile dynamically. Absolutely free.
            </p>
            <div style={{ marginTop: '12px' }}>
              <Link href="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px', fontWeight: '700' }}>
                MULAI SEKARANG &gt;
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Browser Mockup Section */}
      <div style={{
        maxWidth: '1000px',
        margin: '-100px auto 0 auto',
        position: 'relative',
        padding: '0 20px',
        zIndex: 2
      }}>
        {/* Browser Container */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            background: '#1e293b',
            border: '1px solid var(--border-color)',
            boxShadow: isHovered
              ? '0 35px 70px -10px rgba(0, 0, 0, 0.9), 0 0 50px -5px rgba(189, 189, 72, 0.45)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px -10px rgba(189, 189, 72, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transform: isHovered
              ? 'perspective(2000px) rotateX(1deg) rotateY(-2deg) rotateZ(0.5deg) scale(1.02)'
              : 'perspective(2000px) rotateX(4deg) rotateY(-6deg) rotateZ(1.5deg)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Browser Header Bar */}
          <div style={{
            height: '40px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '12px',
            position: 'relative'
          }}>
            {/* Dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#eab308', display: 'inline-block' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
            </div>
            {/* URL Bar */}
            <div style={{
              flex: '1',
              maxWidth: '450px',
              margin: '0 auto',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 12px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              🔒 https://logbook-magang.buildwithjj.store
            </div>
          </div>

          {/* Embedded Image (Fills Browser Viewport) */}
          <img
            src="https://res.cloudinary.com/douoytv3i/image/upload/v1781155763/app_eidhcz.webp"
            alt="Logbook Dashboard Mockup"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: 'brightness(0.95)'
            }}
          />
        </div>
      </div>

      {/* 4. Features Section */}
      <section id="features" style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '80px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>Fitur Utama</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '8px' }}>
            Seluruh tools yang Anda butuhkan untuk mendokumentasikan log aktivitas magang
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1 */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Pencatatan Log Harian</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
              Catat judul tugas, deskripsi detail, jam mulai, jam selesai, kategori, dan tautan bukti dokumentasi dengan mudah.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Statistik Jam Dinamis</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
              Dapatkan pemetaan target total jam, durasi berjalan, serta kalkulasi rata-rata mingguan yang disesuaikan per individu.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Email Pengingat Harian</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
              Menerima email pengingat otomatis jika Anda lupa mengisi aktivitas logbook pada hari berjalan sebelum pukul 20:00 WIB.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Ekspor Laporan CSV</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
              Ekspor seluruh riwayat logbook mingguan Anda langsung ke berkas CSV yang terstruktur rapi untuk pelaporan ke pembimbing.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Kustomisasi Pengaturan</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
              Atur mandiri nama lengkap, target akumulasi jam, tanggal mulai/selesai magang, preferensi notifikasi, dan ubah kata sandi.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Autentikasi & Verifikasi</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
              Sistem pendaftaran aman dengan verifikasi tautan email dan perlindungan enkripsi kata sandi untuk isolasi akun multi-user.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Stats Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(189, 189, 72, 0.07) 50%, var(--bg-secondary) 100%)',
        borderTop: '1px solid rgba(189, 189, 72, 0.2)',
        borderBottom: '1px solid rgba(189, 189, 72, 0.2)',
        padding: '80px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>Trusted by many.</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px', maxWidth: '600px' }}>
              Sistem Logbook Magang mempermudah pelacakan jam magang kumulatif secara akurat bagi siswa, mahasiswa, dan peserta magang industri.
            </p>
          </div>

          {/* Custom stats counters like cron-job.org */}
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Stat 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['1', '8', '4', ',', '3', '2', '0'].map((num, i) => (
                  <span key={i} style={{
                    backgroundColor: 'rgba(189, 189, 72, 0.03)',
                    border: '1px solid rgba(189, 189, 72, 0.25)',
                    padding: '8px 12px',
                    fontSize: '24px',
                    fontWeight: '800',
                    color: num === ',' ? 'var(--text-muted)' : 'var(--primary)',
                    boxShadow: num === ',' ? 'none' : '0 2px 8px rgba(189, 189, 72, 0.1)'
                  }}>
                    {num}
                  </span>
                ))}
                <span style={{ fontSize: '24px', fontWeight: '800', alignSelf: 'flex-end', marginLeft: '4px', color: 'var(--primary)' }}>+</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Jam Kerja Logbook Tercatat
              </span>
            </div>

            {/* Stat 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['2', ',', '4', '5', '0'].map((num, i) => (
                  <span key={i} style={{
                    backgroundColor: 'rgba(189, 189, 72, 0.03)',
                    border: '1px solid rgba(189, 189, 72, 0.25)',
                    padding: '8px 12px',
                    fontSize: '24px',
                    fontWeight: '800',
                    color: num === ',' ? 'var(--text-muted)' : 'var(--primary)',
                    boxShadow: num === ',' ? 'none' : '0 2px 8px rgba(189, 189, 72, 0.1)'
                  }}>
                    {num}
                  </span>
                ))}
                <span style={{ fontSize: '24px', fontWeight: '800', alignSelf: 'flex-end', marginLeft: '4px', color: 'var(--primary)' }}>+</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Pengguna Aktif Terdaftar
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: 'var(--bg-primary)',
        padding: '30px 20px',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} logbook.buildwithjj. store. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Login</Link>
            <Link href="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
