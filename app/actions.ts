'use server';

import { prisma } from '@/utils/prisma';
import { calculateDuration, getWeekIndexForDate, toISODateString } from '@/utils/dateHelpers';
import { LogEntry, LogEntryInput, WeeklyReview } from '@/types';
import { revalidatePath } from 'next/cache';

// Helper to serialize Prisma models to clean JSON structures
function serializeLogEntry(dbEntry: any): LogEntry {
  return {
    id: dbEntry.id,
    title: dbEntry.title,
    date: toISODateString(dbEntry.date),
    startTime: dbEntry.startTime,
    endTime: dbEntry.endTime,
    durationHours: dbEntry.durationHours,
    category: dbEntry.category,
    details: dbEntry.details,
    documentation: dbEntry.documentation,
    createdAt: dbEntry.createdAt.toISOString(),
  };
}

function serializeWeeklyReview(dbReview: any): WeeklyReview {
  return {
    weekIndex: dbReview.weekIndex,
    summaryText: dbReview.summaryText,
    updatedAt: dbReview.updatedAt.toISOString(),
  };
}

// 1. Fetch all log entries
export async function getAllLogEntries(): Promise<LogEntry[]> {
  try {
    const entries = await prisma.logEntry.findMany({
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' },
      ],
    });
    return entries.map(serializeLogEntry);
  } catch (error) {
    console.error('Error fetching log entries:', error);
    return [];
  }
}

// 2. Create a new log entry
export async function createLogEntry(input: LogEntryInput): Promise<{ success: boolean; error?: string }> {
  try {
    const duration = calculateDuration(input.startTime, input.endTime);
    
    // Parse date using midday time to prevent timezone shift errors
    const parsedDate = new Date(`${input.date}T12:00:00`);

    await prisma.logEntry.create({
      data: {
        title: input.title,
        date: parsedDate,
        startTime: input.startTime,
        endTime: input.endTime,
        durationHours: duration,
        category: input.category,
        details: input.details,
        documentation: input.documentation,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error creating log entry:', error);
    return { success: false, error: 'Gagal membuat log entry' };
  }
}

// 3. Update an existing log entry
export async function updateLogEntry(id: string, input: LogEntryInput): Promise<{ success: boolean; error?: string }> {
  try {
    const duration = calculateDuration(input.startTime, input.endTime);
    const parsedDate = new Date(`${input.date}T12:00:00`);

    await prisma.logEntry.update({
      where: { id },
      data: {
        title: input.title,
        date: parsedDate,
        startTime: input.startTime,
        endTime: input.endTime,
        durationHours: duration,
        category: input.category,
        details: input.details,
        documentation: input.documentation,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating log entry:', error);
    return { success: false, error: 'Gagal memperbarui log entry' };
  }
}

// 4. Delete a log entry
export async function deleteLogEntry(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.logEntry.delete({
      where: { id },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting log entry:', error);
    return { success: false, error: 'Gagal menghapus log entry' };
  }
}

// 5. Fetch all weekly reviews
export async function getAllWeeklyReviews(): Promise<WeeklyReview[]> {
  try {
    const reviews = await prisma.weeklyReview.findMany({
      orderBy: { weekIndex: 'asc' },
    });
    return reviews.map(serializeWeeklyReview);
  } catch (error) {
    console.error('Error fetching weekly reviews:', error);
    return [];
  }
}

// 6. Save (create or update) a weekly review
export async function saveWeeklyReview(weekIndex: number, text: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.weeklyReview.upsert({
      where: { weekIndex },
      update: { summaryText: text },
      create: {
        weekIndex,
        summaryText: text,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error saving weekly review:', error);
    return { success: false, error: 'Gagal menyimpan catatan mingguan' };
  }
}
