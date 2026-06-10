'use client';

import React, { useState, useEffect } from 'react';
import { LogEntry, WeeklyReview } from '@/types';
import { WeekRange, getWeeksList } from '@/utils/dateHelpers';
import { saveWeeklyReview } from '@/app/actions';

interface WeeklyOverviewProps {
  entries: LogEntry[];
  reviews: WeeklyReview[];
  activeWeek: number;
  setActiveWeek: (week: number) => void;
}

export default function WeeklyOverview({
  entries,
  reviews,
  activeWeek,
  setActiveWeek,
}: WeeklyOverviewProps) {
  const weeks = getWeeksList();
  const weeklyTarget = 50; // 900 hours / 18 weeks = 50 hours/week average

  // Find review for the current active week
  const activeReview = reviews.find(r => r.weekIndex === activeWeek);
  const [reviewText, setReviewText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync textarea value when the active week changes or database reviews update
  useEffect(() => {
    setReviewText(activeReview?.summaryText || '');
    setSaveSuccess(false);
    setError(null);
  }, [activeWeek, activeReview]);

  // Calculate total hours for a specific week range
  const getWeeklyHours = (startDate: Date, endDate: Date) => {
    // Zero-out hours on boundaries for stable range comparison
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return entries
      .filter(entry => {
        const entryDate = new Date(`${entry.date}T12:00:00`);
        return entryDate >= start && entryDate <= end;
      })
      .reduce((sum, entry) => sum + entry.durationHours, 0);
  };

  const handleSaveReview = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const result = await saveWeeklyReview(activeWeek, reviewText);
      if (result.success) {
        setSaveSuccess(true);
        // Fade out success indicator after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(result.error || 'Gagal menyimpan catatan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Weeks list card */}
      <div className="glass-card">
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Pemetaan Per Minggu</h2>
        
        {/* Scrollable list */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {weeks.map(w => {
            const totalHours = getWeeklyHours(w.startDate, w.endDate);
            const percentage = Math.min(Math.round((totalHours / weeklyTarget) * 100), 100);
            const isActive = w.weekIndex === activeWeek;

            return (
              <button
                key={w.weekIndex}
                onClick={() => setActiveWeek(w.weekIndex)}
                style={{
                  width: '100%',
                  background: isActive ? 'rgba(13, 148, 136, 0.15)' : 'rgba(255, 255, 255, 0.01)',
                  border: isActive ? '1px solid var(--primary-hover)' : '1px solid var(--border-color)',
                  borderRadius: '0',
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '600' }}>
                    {w.label.split(' (')[0]}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {w.label.substring(w.label.indexOf('('))}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontSize: '12px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '700' }}>
                    {totalHours.toFixed(1)} <span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--text-secondary)' }}>/ {weeklyTarget} jam</span>
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: percentage >= 100 ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '0',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: percentage >= 100 ? 'var(--success)' : 'var(--primary)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Review summary card */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700' }}>📝 Rangkuman Minggu {activeWeek}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Evaluasi & pencapaian mingguan Anda</p>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <textarea
            className="form-textarea"
            rows={5}
            placeholder={`Tuliskan rincian pencapaian utama, kendala, atau kesimpulan untuk Minggu ${activeWeek}...`}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            disabled={isSaving}
            style={{ fontSize: '13px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px' }}>
            {saveSuccess && <span style={{ color: 'var(--success)', fontWeight: '600' }}>✓ Berhasil disimpan!</span>}
            {error && <span style={{ color: 'var(--danger)', fontWeight: '600' }}>⚠️ {error}</span>}
          </div>
          <button
            onClick={handleSaveReview}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Rangkuman'}
          </button>
        </div>
      </div>
    </div>
  );
}
