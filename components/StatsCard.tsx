'use client';

import React from 'react';
import { LogEntry } from '@/types';
import { ACTIVITY_CATEGORIES } from '@/types';
import { formatIndonesianDate } from '@/utils/dateHelpers';

interface StatsCardProps {
  entries: LogEntry[];
  targetHours: number;
  internshipStart: string;
  internshipEnd: string;
}

export default function StatsCard({ entries, targetHours, internshipStart, internshipEnd }: StatsCardProps) {
  // Calculate total completed hours
  const completedHours = entries.reduce((acc, entry) => acc + entry.durationHours, 0);
  const remainingHours = Math.max(targetHours - completedHours, 0);
  const percentage = Math.min(Number(((completedHours / targetHours) * 100).toFixed(1)), 100);

  // Dynamic Planner Calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startRange = new Date(internshipStart);
  const endRange = new Date(internshipEnd);
  
  let daysRemaining = 0;
  if (today < startRange) {
    // Before internship starts, all days are remaining
    const diffTime = endRange.getTime() - startRange.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else if (today > endRange) {
    daysRemaining = 0;
  } else {
    // During internship
    const diffTime = endRange.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const requiredDailyHours = daysRemaining > 0 ? Number((remainingHours / daysRemaining).toFixed(2)) : 0;
  const requiredWeeklyHours = daysRemaining > 0 ? Number((remainingHours / (daysRemaining / 7)).toFixed(2)) : 0;

  // SVG Progress Ring calculations
  const radius = 75;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Category breakdown calculation
  const categoryHours = ACTIVITY_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<string, number>);

  entries.forEach(entry => {
    const cat = entry.category || 'Other';
    if (categoryHours[cat] !== undefined) {
      categoryHours[cat] += entry.durationHours;
    } else {
      categoryHours['Other'] += entry.durationHours;
    }
  });

  const categoryData = Object.entries(categoryHours)
    .map(([category, hours]) => ({
      category,
      hours,
      percentage: completedHours > 0 ? Number(((hours / completedHours) * 100).toFixed(1)) : 0,
    }))
    .filter(item => item.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  // Category Color Map
  const categoryColors: Record<string, string> = {
    'Coding': '#0ea5e9',         // Sky Blue
    'Meeting': '#f59e0b',        // Amber
    'UI/UX Design': '#ec4899',   // Pink
    'Self-learning': '#8b5cf6',  // Violet
    'Documentation': '#10b981',  // Emerald
    'Bug Fixing': '#f43f5e',     // Rose
    'Other': '#64748b',          // Slate
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Statistik Akumulasi Jam</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Target: {targetHours} Jam ({formatIndonesianDate(startRange)} s/d {formatIndonesianDate(endRange)})</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
        {/* SVG Circular Progress Ring */}
        <div style={{ position: 'relative', width: `${radius * 2}px`, height: `${radius * 2}px` }}>
          <svg width={radius * 2} height={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              stroke="rgba(255,255,255,0.03)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="var(--primary)"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>
              {percentage}%
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: '500' }}>
              selesai
            </span>
          </div>
        </div>

        {/* Text Stats */}
        <div style={{ flex: '1', minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Jam Terpenuhi</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success)' }}>
              {completedHours.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>/ {targetHours} jam</span>
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Sisa Jam Kerja</span>
            <span style={{ fontSize: '18px', fontWeight: '700' }}>{remainingHours.toFixed(1)} jam</span>
          </div>
        </div>
      </div>

      {/* Target Planner Section */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '0',
        padding: '16px',
        border: '1px solid rgba(255,255,255,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📅</span> Target Kerja Tersisa
        </h3>
        
        {daysRemaining > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div>Sisa waktu magang: <strong style={{ color: 'var(--text-primary)' }}>{daysRemaining} hari</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span>Rata-rata Harian:</span>
              <strong style={{ color: 'var(--primary-hover)' }}>{requiredDailyHours} jam / hari</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Rata-rata Mingguan:</span>
              <strong style={{ color: 'var(--primary-hover)' }}>{requiredWeeklyHours} jam / minggu</strong>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--success)' }}>
            🎉 Rentang magang telah selesai! Target tercapai atau terlampaui.
          </div>
        )}
      </div>

      {/* Category Distribution Section */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Distribusi Aktivitas</h3>
        {categoryData.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categoryData.map(item => (
              <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '0',
                      backgroundColor: categoryColors[item.category] || '#fff',
                      display: 'inline-block'
                    }} />
                    {item.category}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong>{item.hours.toFixed(1)} jam</strong> ({item.percentage}%)
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '0',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${item.percentage}%`,
                    height: '100%',
                    backgroundColor: categoryColors[item.category] || '#fff',
                    borderRadius: '0'
                  }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
            Belum ada data aktivitas yang dicatat
          </p>
        )}
      </div>
    </div>
  );
}
