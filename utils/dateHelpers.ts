export const INTERNSHIP_START = new Date('2026-05-20T00:00:00');
export const INTERNSHIP_END = new Date('2026-09-20T23:59:59');

export interface WeekRange {
  weekIndex: number;
  startDate: Date;
  endDate: Date;
  label: string;
}

// Generates the list of 18 weeks for the internship period (May 20 - Sept 20, 2026)
export function getWeeksList(): WeekRange[] {
  const weeks: WeekRange[] = [];
  const start = new Date(INTERNSHIP_START);

  for (let i = 1; i <= 18; i++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (i - 1) * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Caps the last week at Sept 20, 2026
    const actualEnd = weekEnd > INTERNSHIP_END ? new Date(INTERNSHIP_END) : weekEnd;

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

// Returns the week index (1-18) for a given date. Returns -1 if outside internship range.
export function getWeekIndexForDate(dateInput: Date | string): number {
  const date = new Date(dateInput);
  date.setHours(12, 0, 0, 0); // avoid timezone boundary errors
  
  if (date < INTERNSHIP_START || date > INTERNSHIP_END) {
    // If it's slightly before start or after end, clamp to nearest week if user chooses to log
    if (date < INTERNSHIP_START) return 1;
    if (date > INTERNSHIP_END) return 18;
  }

  const diffTime = date.getTime() - INTERNSHIP_START.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffDays / 7) + 1;

  return Math.min(Math.max(weekIndex, 1), 18);
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
