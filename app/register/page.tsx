'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Form validations
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Semua kolom wajib diisi');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal terdiri dari 6 karakter');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await registerUser(fullName, email, password);
      if (result.success) {
        // Redirection to dashboard is handled automatically by Next.js revalidation/middleware, 
        // but we push path refresh to make sure it loads.
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'Registrasi gagal. Coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Registrasi Akun</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Buat akun untuk melacak logbook magang Anda
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: 'var(--danger)',
            padding: '12px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Pangeran"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label">Konfirmasi Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Ulangi password Anda"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '15px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          marginTop: '4px'
        }}>
          Sudah punya akun?{' '}
          <Link href="/login" style={{ color: 'var(--primary-hover)', fontWeight: '600', textDecoration: 'underline' }}>
            Login disini
          </Link>
        </div>
      </div>
    </div>
  );
}
