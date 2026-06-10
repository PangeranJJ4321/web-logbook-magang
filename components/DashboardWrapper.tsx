'use client';

import React, { useState, useEffect } from 'react';
import { LogEntry, WeeklyReview } from '@/types';
import { getWeekIndexForDate } from '@/utils/dateHelpers';
import StatsCard from './StatsCard';
import WeeklyOverview from './WeeklyOverview';
import LogList from './LogList';
import LogEntryForm from './LogEntryForm';

interface DashboardWrapperProps {
  initialEntries: LogEntry[];
  initialReviews: WeeklyReview[];
}

export default function DashboardWrapper({
  initialEntries,
  initialReviews,
}: DashboardWrapperProps) {
  // Determine current week index based on today's date
  const [activeWeek, setActiveWeek] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<LogEntry | null>(null);

  // Calculate and set initial active week once on client mount
  useEffect(() => {
    const currentWeekIndex = getWeekIndexForDate(new Date());
    setActiveWeek(currentWeekIndex);
  }, []);

  const handleOpenAddForm = () => {
    setEditData(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (entry: LogEntry) => {
    setEditData(entry);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditData(null);
  };

  const handleSelectWeek = (week: number) => {
    setActiveWeek(week);
    setIsSidebarOpen(false); // Close mobile drawer when week changes
  };

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      {/* Header bar */}
      <header className="dashboard-header">
        <div className="dashboard-title-area">
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: 'var(--text-primary)'
          }}>
            Logbook Magang
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Pencatatan aktivitas harian & pemantauan target 900 jam magang
          </p>
        </div>
        
        <div className="dashboard-actions-area">
          {/* Menu Toggle Button for Mobile */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="btn btn-secondary mobile-menu-btn"
            style={{ padding: '12px 18px', fontSize: '14px' }}
          >
            ☰ Ringkasan
          </button>
          
          <button
            onClick={handleOpenAddForm}
            className="btn btn-primary"
            style={{ padding: '12px 18px', fontSize: '14px' }}
          >
            Tambah Log Harian
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="main-dashboard-grid">
        {/* Backdrop for mobile drawer */}
        <div
          className={`mobile-sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar Column (Normal column on desktop, sliding drawer on mobile) */}
        <div className={`mobile-sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
          {/* Mobile close button header */}
          <div className="mobile-sidebar-close-header" style={{ display: 'none', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              ✕ Tutup Menu
            </button>
          </div>

          <StatsCard entries={initialEntries} />
          
          <WeeklyOverview
            entries={initialEntries}
            reviews={initialReviews}
            activeWeek={activeWeek}
            setActiveWeek={handleSelectWeek}
          />
        </div>

        {/* Content Right Column */}
        <div>
          <LogList
            entries={initialEntries}
            activeWeek={activeWeek}
            onEdit={handleOpenEditForm}
            onDeleteSuccess={handleCloseForm}
          />
        </div>
      </div>

      {/* Entry Dialog Form */}
      <LogEntryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editData={editData}
      />
    </div>
  );
}
