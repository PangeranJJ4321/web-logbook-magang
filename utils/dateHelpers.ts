export const INTERNSHIP_START = new Date('2026-05-20T00:00:00');
export const INTERNSHIP_END = new Date('2026-09-20T23:59:59');

export interface WeekRange {
  weekIndex: number;
  startDate: Date;
  endDate: Date;
  label: string;
}

// Generates the list of weeks dynamically for the internship period
export function getWeeksList(startInput?: Date | string, endInput?: Date | string): WeekRange[] {
  const start = startInput ? new Date(startInput) : INTERNSHIP_START;
  const end = endInput ? new Date(endInput) : INTERNSHIP_END;

  // Normalize start to midnight, end to end-of-day
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);

  const diffTime = e.getTime() - s.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.max(Math.ceil(diffDays / 7), 1);

  const weeks: WeekRange[] = [];

  for (let i = 1; i <= totalWeeks; i++) {
    const weekStart = new Date(s);
    weekStart.setDate(s.getDate() + (i - 1) * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Caps the last week at the dynamic end date
    const actualEnd = weekEnd > e ? new Date(e) : weekEnd;

    // Formatting label in Indonesian
    const startStr = formatDateShort(weekStart);
    const endStr = formatDateShort(actualEnd);
    
    weeks.push({
      weekIndex: i,
      startDate: weekStart,
      endDate: actualEnd,
      label: `Minggu ${i} (${startStr} - ${endStr})`,
    });
  }
  return weeks;
}

// Returns the week index (1-N) for a given date based on dynamic start/end ranges.
export function getWeekIndexForDate(
  dateInput: Date | string,
  startInput?: Date | string,
  endInput?: Date | string
): number {
  const start = startInput ? new Date(startInput) : INTERNSHIP_START;
  const end = endInput ? new Date(endInput) : INTERNSHIP_END;

  const date = new Date(dateInput);
  date.setHours(12, 0, 0, 0); // avoid timezone boundary errors
  
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);

  const diffTimeTotal = e.getTime() - s.getTime();
  const diffDaysTotal = Math.ceil(diffTimeTotal / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.max(Math.ceil(diffDaysTotal / 7), 1);
  
  if (date < s || date > e) {
    // If it's slightly before start or after end, clamp to nearest week
    if (date < s) return 1;
    if (date > e) return totalWeeks;
  }

  const diffTime = date.getTime() - s.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffDays / 7) + 1;

  return Math.min(Math.max(weekIndex, 1), totalWeeks);
}

// Formats "2026-05-20" or Date object to Indonesian formatted date (e.g. "Rabu, 20 Mei 2026")
export function formatIndonesianDate(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

function formatDateShort(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

// Calculates the duration between two times (e.g., "08:00" to "17:00") in decimal hours
export function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (endMinutes <= startMinutes) {
    // If end time is before start time, assume it spans to the next day
    // For internship logbook, we can cap it or calculate next day
    const nextDayEnd = (endH + 24) * 60 + endM;
    return Number(((nextDayEnd - startMinutes) / 60).toFixed(2));
  }

  return Number(((endMinutes - startMinutes) / 60).toFixed(2));
}

// Helper to check if a string is a valid ISO date YYYY-MM-DD
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
