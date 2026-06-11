'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { updateUserSettings } from '@/app/actions';

interface UserSettingsData {
  fullName: string;
  targetHours: number;
  internshipStart: string;
  internshipEnd: string;
  sendReminders: boolean;
}

interface SettingsFormProps {
  initialData: UserSettingsData;
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [fullName, setFullName] = useState(initialData.fullName);
  const [targetHours, setTargetHours] = useState(initialData.targetHours);
  const [internshipStart, setInternshipStart] = useState(initialData.internshipStart);
  const [internshipEnd, setInternshipEnd] = useState(initialData.internshipEnd);
  const [sendReminders, setSendReminders] = useState(initialData.sendReminders);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    // Client-side validations
    if (!fullName.trim() || !internshipStart || !internshipEnd) {
      setError('Nama lengkap dan tanggal magang wajib diisi.');
      setIsSubmitting(false);
      return;
    }

    if (Number(targetHours) <= 0) {
      setError('Target jam magang harus lebih dari 0.');
      setIsSubmitting(false);
      return;
    }

    const start = new Date(internshipStart);
    const end = new Date(internshipEnd);
    if (start > end) {
      setError('Tanggal mulai magang tidak boleh setelah tanggal selesai.');
      setIsSubmitting(false);
      return;
    }

    // Password change validation
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError('Kata sandi saat ini wajib diisi untuk mengubah kata sandi.');
        setIsSubmitting(false);
        return;
      }
      if (newPassword.length < 6) {
        setError('Kata sandi baru minimal harus terdiri dari 6 karakter.');
        setIsSubmitting(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Konfirmasi kata sandi baru tidak cocok.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const result = await updateUserSettings({
        fullName,
        targetHours: Number(targetHours),
        internshipStart,
        internshipEnd,
        sendReminders,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });

      if (result.success) {
        setSuccessMessage('✓ Pengaturan akun Anda berhasil diperbarui!');
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error || 'Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '650px',
      margin: '0 auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Pengaturan Profil</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Sesuaikan detail profil magang dan keamanan akun Anda
          </p>
        </div>
        <Link href="/" className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
          ← Dashboard
        </Link>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: 'var(--success)',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          color: 'var(--danger)',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Details Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '4px' }}>
            Profil Magang
          </h2>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label">Target Total Jam Magang</label>
            <input
              type="number"
              className="form-input"
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Tanggal Mulai Magang</label>
              <input
                type="date"
                className="form-input"
                value={internshipStart}
                onChange={(e) => setInternshipStart(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Tanggal Selesai Magang</label>
              <input
                type="date"
                className="form-input"
                value={internshipEnd}
                onChange={(e) => setInternshipEnd(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Notifications Preference Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '4px' }}>
            Preferensi Notifikasi
          </h2>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '4px 0' }}>
            <input
              type="checkbox"
              id="sendReminders"
              checked={sendReminders}
              onChange={(e) => setSendReminders(e.target.checked)}
              disabled={isSubmitting}
              style={{
                width: '18px',
                height: '18px',
                marginTop: '3px',
                cursor: 'pointer',
                accentColor: 'var(--primary)'
              }}
            />
            <label htmlFor="sendReminders" style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Kirimkan Email Pengingat Harian</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Kami akan mengirimkan email jika Anda belum mencatat aktivitas logbook magang pada hari berjalan sebelum pukul 20:00 WIB.
              </span>
            </label>
          </div>
        </div>

        {/* Security Password Change Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '4px' }}>
            Keamanan Akun (Ganti Password)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '-8px', marginBottom: '4px' }}>
            Biarkan kolom-kolom ini kosong jika Anda tidak ingin mengganti kata sandi.
          </p>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label">Kata Sandi Saat Ini</label>
            <input
              type="password"
              className="form-input"
              placeholder="Masukkan sandi saat ini"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Kata Sandi Baru</label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                className="form-input"
                placeholder="Masukkan kembali sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Action Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Link href="/" className="btn btn-secondary" style={{ width: 'auto' }}>
            Batal
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ minWidth: '150px' }}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
