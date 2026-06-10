'use server';

import { prisma } from '@/utils/prisma';
import { calculateDuration, getWeekIndexForDate, toISODateString } from '@/utils/dateHelpers';
import { LogEntry, LogEntryInput, WeeklyReview } from '@/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { signJWT, verifyJWT } from '@/utils/auth';

// Helper to extract session payload
async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

// ==========================================
// AUTHENTICATION SERVER ACTIONS
// ==========================================

// 1. User Registration
export async function registerUser(fullName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedEmail = email.toLowerCase().trim();
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });
    
    if (existingUser) {
      return { success: false, error: 'Email sudah terdaftar' };
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        fullName,
        email: formattedEmail,
        passwordHash,
      },
    });

    // Sign JWT and set HTTP-only cookie
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error: 'Terjadi kesalahan saat registrasi' };
  }
}

// 2. User Login
export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedEmail = email.toLowerCase().trim();
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (!user) {
      return { success: false, error: 'Email atau password salah' };
    }

    // Verify password hash
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return { success: false, error: 'Email atau password salah' };
    }

    // Sign JWT and set cookie
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Error logging in user:', error);
    return { success: false, error: 'Terjadi kesalahan saat login' };
  }
}

// 3. User Logout
export async function logoutUser(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  revalidatePath('/');
  return { success: true };
}

// ==========================================
// LOGBOOK DATABASE SERVER ACTIONS (SCOPED TO USER)
// ==========================================

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

// 1. Fetch user-specific log entries
export async function getAllLogEntries(): Promise<LogEntry[]> {
  try {
    const session = await getSessionUser();
    if (!session) return [];

    const entries = await prisma.logEntry.findMany({
      where: { userId: session.userId },
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

// 2. Create a new log entry linked to user
export async function createLogEntry(input: LogEntryInput): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: 'Sesi kedaluwarsa. Silakan login kembali.' };

    const duration = calculateDuration(input.startTime, input.endTime);
    const parsedDate = new Date(`${input.date}T12:00:00`);

    await prisma.logEntry.create({
      data: {
        userId: session.userId, // Link to authenticated user
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

// 3. Update log entry checking user ownership
export async function updateLogEntry(id: string, input: LogEntryInput): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: 'Sesi kedaluwarsa. Silakan login kembali.' };

    const duration = calculateDuration(input.startTime, input.endTime);
    const parsedDate = new Date(`${input.date}T12:00:00`);

    // Guard update with userId check
    await prisma.logEntry.update({
      where: { 
        id,
        userId: session.userId 
      },
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

// 4. Delete log entry checking user ownership
export async function deleteLogEntry(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: 'Sesi kedaluwarsa. Silakan login kembali.' };

    // Guard delete with userId check
    await prisma.logEntry.delete({
      where: { 
        id,
        userId: session.userId
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting log entry:', error);
    return { success: false, error: 'Gagal menghapus log entry' };
  }
}

// 5. Fetch user-specific weekly reviews
export async function getAllWeeklyReviews(): Promise<WeeklyReview[]> {
  try {
    const session = await getSessionUser();
    if (!session) return [];

    const reviews = await prisma.weeklyReview.findMany({
      where: { userId: session.userId },
      orderBy: { weekIndex: 'asc' },
    });
    return reviews.map(serializeWeeklyReview);
  } catch (error) {
    console.error('Error fetching weekly reviews:', error);
    return [];
  }
}

// 6. Save (create or update) weekly review checking user constraint
export async function saveWeeklyReview(weekIndex: number, text: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: 'Sesi kedaluwarsa. Silakan login kembali.' };

    await prisma.weeklyReview.upsert({
      where: {
        userId_weekIndex: {
          userId: session.userId,
          weekIndex,
        },
      },
      update: { summaryText: text },
      create: {
        userId: session.userId,
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
