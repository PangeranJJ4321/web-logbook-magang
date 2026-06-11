'use client';

import React, { useState } from 'react';
import { LogEntry } from '@/types';
import { getWeeksList, formatIndonesianDate } from '@/utils/dateHelpers';
import { deleteLogEntry } from '@/app/actions';

interface LogListProps {
  entries: LogEntry[];
  activeWeek: number;
  onEdit: (entry: LogEntry) => void;
  onDeleteSuccess: () => void;
  internshipStart: string;
  internshipEnd: string;
}

export default function LogList({
  entries,
  activeWeek,
  onEdit,
  onDeleteSuccess,
  internshipStart,
  internshipEnd,
}: LogListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const weeks = getWeeksList(internshipStart, internshipEnd);
  const currentWeek = weeks.find(w => w.weekIndex === activeWeek);

  // 1. Filter entries belonging to the active week
  const activeWeekEntries = currentWeek
    ? entries.filter(entry => {
      const entryDate = new Date(`${entry.date}T12:00:00`);
      const start = new Date(currentWeek.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentWeek.endDate);
      end.setHours(23, 59, 59, 999);

      return entryDate >= start && entryDate <= end;
    })
    : [];

  // 2. Apply search and category filters
  const filteredEntries = activeWeekEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.documentation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || entry.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate total hours for filtered entries
  const totalFilteredHours = filteredEntries.reduce((sum, entry) => sum + entry.durationHours, 0);

  // Category Color Map
  const categoryColors: Record<string, { bg: string; text: string }> = {
    'Coding': { bg: 'rgba(14, 165, 233, 0.15)', text: '#0ea5e9' },
    'Meeting': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    'UI/UX Design': { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899' },
    'Self-learning': { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6' },
    'Documentation': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
    'Bug Fixing': { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e' },
    'Other': { bg: 'rgba(100, 116, 139, 0.15)', text: '#64748b' },
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteLogEntry(id);
      if (result.success) {
        onDeleteSuccess();
      } else {
        alert(result.error || 'Gagal menghapus log entry');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Client-side CSV export
  const handleExportCSV = () => {
    if (filteredEntries.length === 0) return;

    const headers = ['ID', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Durasi (Jam)', 'Kategori', 'Judul Aktivitas', 'Detail Aktivitas', 'Link Dokumentasi'];
    const rows = filteredEntries.map(entry => [
      entry.id,
      entry.date,
      entry.startTime,
      entry.endTime,
      entry.durationHours,
      entry.category,
      `"${entry.title.replace(/"/g, '""')}"`,
      `"${entry.details.replace(/"/g, '""')}"`,
      `"${entry.documentation.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `logbook_magang_minggu_${activeWeek}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
            Rincian Aktivitas — Minggu {activeWeek}
          </h2>
          {currentWeek && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
              Rentang: {formatIndonesianDate(currentWeek.startDate)} s/d {formatIndonesianDate(currentWeek.endDate)}
            </p>
          )}
        </div>

        {/* CSV Export Button */}
        {filteredEntries.length > 0 && (
          <button onClick={handleExportCSV} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}>
            📥 Ekspor CSV (.csv)
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cari judul atau catatan..."
          className="form-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '2', minWidth: '200px' }}
        />
        <select
          className="form-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ flex: '1', minWidth: '130px' }}
        >
          <option value="All" style={{ backgroundColor: 'var(--bg-secondary)' }}>Semua Kategori</option>
          {Object.keys(categoryColors).map(cat => (
            <option key={cat} value={cat} style={{ backgroundColor: 'var(--bg-secondary)' }}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Entries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => {
            const colors = categoryColors[entry.category] || categoryColors['Other'];
            const entryDateFormatted = formatIndonesianDate(new Date(`${entry.date}T12:00:00`));

            return (
              <div
                key={entry.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '0',
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                {/* Entry Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {entry.category}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {entryDateFormatted}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        • {entry.startTime} - {entry.endTime} ({entry.durationHours} Jam)
                      </span>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {entry.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onEdit(entry)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '0' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus aktivitas "${entry.title}"?`)) {
                          handleDelete(entry.id);
                        }
                      }}
                      className="btn btn-danger"
                      style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '0' }}
                      disabled={isDeleting === entry.id}
                    >
                      {isDeleting === entry.id ? 'Menghapus...' : '🗑️ Hapus'}
                    </button>
                  </div>
                </div>

                {/* Entry Details */}
                {entry.details && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '0',
                    borderLeft: '3px solid var(--primary)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {entry.details}
                  </div>
                )}

                {/* Entry Documentation Link */}
                {entry.documentation && (
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '2px',
                    padding: '0 4px'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>🔗</span>
                    {entry.documentation.startsWith('http') ? (
                      <a
                        href={entry.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--primary-hover)',
                          textDecoration: 'underline',
                          wordBreak: 'break-all'
                        }}
                      >
                        {entry.documentation}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>
                        Dokumentasi: <strong style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{entry.documentation}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            border: '2px dashed var(--border-color)',
            borderRadius: '16px',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Tidak ada data ditemukan</strong>
            <p style={{ fontSize: '12px', maxWidth: '320px', margin: '0 auto' }}>
              {activeWeekEntries.length > 0
                ? 'Tidak ada data yang cocok dengan kriteria pencarian atau kategori Anda.'
                : `Belum ada log yang dicatat untuk Minggu ${activeWeek}. Klik tombol "Tambah Log" di atas untuk mulai mencatat.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Filter summary stats */}
      {filteredEntries.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '14px'
        }}>
          <span>Total filter: <strong>{filteredEntries.length} log</strong> ({totalFilteredHours.toFixed(1)} jam)</span>
        </div>
      )}
    </div>
  );
}
