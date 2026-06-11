'use server';

import { prisma } from '@/utils/prisma';
import { calculateDuration, getWeekIndexForDate, toISODateString } from '@/utils/dateHelpers';
import { LogEntry, LogEntryInput, WeeklyReview } from '@/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { signJWT, verifyJWT } from '@/utils/auth';
import { resend, emailConfig } from '@/utils/resend';
import crypto from 'crypto';

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
export async function registerUser(fullName: string, email: string, password: string): Promise<{ success: boolean; needsConfirmation?: boolean; error?: string }> {
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

    // Generate secure random verification token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create user in DB with emailVerified false and verification token
    const user = await prisma.user.create({
      data: {
        fullName,
        email: formattedEmail,
        passwordHash,
        emailVerified: false,
        verificationToken: token,
        verificationTokenExpires: tokenExpires,
      },
    });

    console.log('DEBUG RESEND CONFIG:', {
      hasResend: !!resend,
      envKey: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.slice(0, 10)}...` : 'undefined',
      rawEnv: process.env.RESEND_API_KEY
    });

    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/confirm?token=${token}`;

    if (resend) {
      try {
        await resend.emails.send({
          from: emailConfig.from,
          to: formattedEmail,
          subject: 'Konfirmasi Akun Logbook Magang Anda',
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
              <h2 style="color: #0f172a; text-align: center; margin-top: 0; font-size: 22px; font-weight: 700;">Konfirmasi Email Anda</h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                Halo <strong>${fullName}</strong>!<br/>
                Terima kasih telah mendaftar di Sistem Logbook Magang. Silakan klik tombol di bawah ini untuk mengonfirmasi email Anda dan mengaktifkan akun Anda:
              </p>
              
              <div style="margin: 32px 0; text-align: center;">
                <a href="${confirmUrl}" style="background-color: #bdbd48; color: #0b0f19; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(189, 189, 72, 0.2), 0 2px 4px -2px rgba(189, 189, 72, 0.2); transition: background-color 0.2s;">
                  Konfirmasi Email
                </a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                Jika Anda tidak merasa mendaftar di aplikasi ini, silakan abaikan email ini.
              </p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Error sending confirmation email via Resend:', emailErr);
      }
    } else {
      console.warn('Resend is not configured. Email confirmation link is:', confirmUrl);
    }

    return { success: true, needsConfirmation: true };
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

    // Check if email is verified
    if (!user.emailVerified) {
      return { success: false, error: 'Email belum dikonfirmasi. Silakan periksa email Anda untuk melakukan konfirmasi.' };
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

// 7. Resend Verification Email
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (!user) {
      return { success: false, error: 'Email tidak terdaftar.' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email sudah terkonfirmasi, silakan langsung login.' };
    }

    // Generate secure random verification token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update user in DB with new verification token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
        verificationTokenExpires: tokenExpires,
      },
    });

    // Send email confirmation link with token parameter
    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/confirm?token=${token}`;

    if (resend) {
      try {
        await resend.emails.send({
          from: emailConfig.from,
          to: formattedEmail,
          subject: ' Konfirmasi Akun Logbook Magang Anda',
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;"></span>
              </div>
              <h2 style="color: #0f172a; text-align: center; margin-top: 0; font-size: 22px; font-weight: 700;">Konfirmasi Email Anda</h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                Halo <strong>${user.fullName}</strong>!<br/>
                Silakan klik tombol di bawah ini untuk mengonfirmasi email Anda dan mengaktifkan akun Anda:
              </p>
              
              <div style="margin: 32px 0; text-align: center;">
                <a href="${confirmUrl}" style="background-color: #bdbd48; color: #0b0f19; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(189, 189, 72, 0.2), 0 2px 4px -2px rgba(189, 189, 72, 0.2); transition: background-color 0.2s;">
                  Konfirmasi Email
                </a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                Jika Anda tidak merasa mendaftar di aplikasi ini, silakan abaikan email ini.
              </p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Error resending confirmation email via Resend:', emailErr);
      }
    } else {
      console.warn('Resend is not configured. Email confirmation link is:', confirmUrl);
    }

    return { success: true };
  } catch (error) {
    console.error('Error resending verification email:', error);
    return { success: false, error: 'Terjadi kesalahan saat memproses permintaan.' };
  }
}
