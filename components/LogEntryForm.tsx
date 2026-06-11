'use client';

import React, { useState, useEffect } from 'react';
import { LogEntry, LogEntryInput, ACTIVITY_CATEGORIES, ActivityCategory } from '@/types';
import { createLogEntry, updateLogEntry } from '@/app/actions';
import { calculateDuration, formatIndonesianDate } from '@/utils/dateHelpers';

interface LogEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData: LogEntry | null;
  internshipStart: string;
  internshipEnd: string;
}

export default function LogEntryForm({
  isOpen,
  onClose,
  editData,
  internshipStart,
  internshipEnd,
}: LogEntryFormProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [category, setCategory] = useState<ActivityCategory>('Coding');
  const [details, setDetails] = useState('');
  const [documentation, setDocumentation] = useState('');
  
  const [duration, setDuration] = useState(9);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data if editing
  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setDate(editData.date);
      setStartTime(editData.startTime);
      setEndTime(editData.endTime);
      setCategory(editData.category as ActivityCategory);
      setDetails(editData.details || '');
      setDocumentation(editData.documentation || '');
    } else {
      // Set default date to today's date clamped within the internship range if possible
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const todayStr = `${year}-${month}-${day}`;
      
      const startRange = new Date(internshipStart);
      const endRange = new Date(internshipEnd);
      
      if (today >= startRange && today <= endRange) {
        setDate(todayStr);
      } else {
        setDate(internshipStart);
      }
      
      setTitle('');
      setStartTime('08:00');
      setEndTime('17:00');
      setCategory('Coding');
      setDetails('');
      setDocumentation('');
    }
    setError(null);
  }, [editData, isOpen, internshipStart, internshipEnd]);

  // Recalculate duration in real-time
  useEffect(() => {
    if (startTime && endTime) {
      setDuration(calculateDuration(startTime, endTime));
    }
  }, [startTime, endTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validations
    if (!title.trim()) {
      setError('Judul aktivitas wajib diisi');
      setIsSubmitting(false);
      return;
    }

    if (!details.trim()) {
      setError('Detail aktivitas (catatan) wajib diisi');
      setIsSubmitting(false);
      return;
    }
    
    if (!date) {
      setError('Tanggal aktivitas wajib diisi');
      setIsSubmitting(false);
      return;
    }

    const logDate = new Date(date);
    const startRange = new Date(internshipStart);
    const endRange = new Date(internshipEnd);
    
    if (logDate < startRange || logDate > endRange) {
      setError(`Tanggal harus berada dalam rentang magang (${formatIndonesianDate(startRange)} s/d ${formatIndonesianDate(endRange)})`);
      setIsSubmitting(false);
      return;
    }

    if (duration <= 0) {
      setError('Jam selesai harus setelah jam mulai');
      setIsSubmitting(false);
      return;
    }

    if (duration > 16) {
      setError('Durasi kerja harian tidak boleh melebihi 16 jam');
      setIsSubmitting(false);
      return;
    }

    const inputData: LogEntryInput = {
      title,
      date,
      startTime,
      endTime,
      category,
      details,
      documentation,
    };

    try {
      let result;
      if (editData) {
        result = await updateLogEntry(editData.id, inputData);
      } else {
        result = await createLogEntry(inputData);
      }

      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Terjadi kesalahan saat menyimpan data.');
      }
    } catch (err) {
      setError('Terjadi kesalahan pada server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.01)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
            {editData ? '✏️ Edit Log Aktivitas' : '➕ Tambah Log Aktivitas'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            &times;
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: 'var(--danger)',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Judul Aktivitas</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Membuat tampilan dashboard utama"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input
                type="date"
                className="form-input"
                min={internshipStart}
                max={internshipEnd}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                disabled={isSubmitting}
              >
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Jam Mulai</label>
              <input
                type="time"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jam Selesai</label>
              <input
                type="time"
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Real-time calculated duration info */}
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            padding: '10px 14px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Estimasi Durasi Kerja:</span>
            <strong style={{ color: duration > 0 ? 'var(--success)' : 'var(--danger)', fontSize: '15px' }}>
              {duration} Jam
            </strong>
          </div>

          <div className="form-group">
            <label className="form-label">Detail Aktivitas (Catatan)</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Tuliskan rincian apa saja yang dikerjakan hari ini, kendala, atau pencapaian..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              disabled={isSubmitting}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Link Dokumentasi (Opsional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: https://github.com/... atau link Google Drive"
              value={documentation}
              onChange={(e) => setDocumentation(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '8px'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
