'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser, resendVerificationEmail } from '@/app/actions';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmed = searchParams.get('confirmed') === 'true';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (isResending || cooldown > 0) return;
    if (!email.trim()) {
      setResendError('Silakan masukkan alamat email Anda terlebih dahulu.');
      return;
    }
    setIsResending(true);
    setResendMessage(null);
    setResendError(null);

    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        setResendMessage('✓ Email konfirmasi baru berhasil dikirim!');
        setCooldown(60);
      } else {
        setResendError(result.error || 'Gagal mengirim ulang email.');
      }
    } catch (err) {
      setResendError('Terjadi kesalahan koneksi.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await loginUser(email, password);
      if (result.success) {
        // Redirection is handled by Next.js revalidation, but push refresh to make sure it re-renders
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'Login gagal. Periksa kembali email dan password.');
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
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Masuk Logbook</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Masuk untuk mengakses dan mencatat aktivitas magang Anda
          </p>
        </div>

        {confirmed && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--success)',
            padding: '12px',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '0'
          }}>
            ✓ Email berhasil dikonfirmasi! Silakan masuk ke akun Anda.
          </div>
        )}

        {resendMessage && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--success)',
            padding: '12px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            {resendMessage}
          </div>
        )}

        {resendError && (
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: 'var(--danger)',
            padding: '12px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            ⚠️ {resendError}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: 'var(--danger)',
            padding: '12px',
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span>⚠️ {error}</span>
            {error.includes('belum dikonfirmasi') && (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending || cooldown > 0}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-hover)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  textAlign: 'left',
                  padding: '0',
                  alignSelf: 'flex-start'
                }}
              >
                {isResending ? 'Mengirim ulang...' : cooldown > 0 ? `Kirim ulang dalam ${cooldown}s` : 'Kirim Ulang Email Konfirmasi'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              placeholder="Password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '15px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Masuk...' : 'Masuk ke Dashboard'}
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
          Belum punya akun?{' '}
          <Link href="/register" style={{ color: 'var(--primary-hover)', fontWeight: '600', textDecoration: 'underline' }}>
            Registrasi disini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Memuat...
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
