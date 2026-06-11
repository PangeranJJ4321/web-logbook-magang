import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { resend, emailConfig } from '@/utils/resend';
import { formatIndonesianDate } from '@/utils/dateHelpers';

export async function GET(request: Request) {
  try {
    // 1. Authorization check
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('secret');
    const authHeader = request.headers.get('authorization');

    const expectedSecret = process.env.CRON_SECRET;
    
    // Ensure secret is configured before checking
    if (expectedSecret) {
      const isTokenValid = token === expectedSecret;
      const isHeaderValid = authHeader === `Bearer ${expectedSecret}`;
      
      if (!isTokenValid && !isHeaderValid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 2. Identify "today" in Indonesian local timezone (WIB, UTC+7)
    const now = new Date();
    // Offset local server time to WIB
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibTime = new Date(utcTime + (7 * 60 * 60 * 1000));
    
    const year = wibTime.getFullYear();
    const month = String(wibTime.getMonth() + 1).padStart(2, '0');
    const day = String(wibTime.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Define search range for today
    const startOfDay = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${todayStr}T23:59:59.999Z`);

    // 3. Query all verified users who have not logged any activity for today
    const usersWithoutLog = await prisma.user.findMany({
      where: {
        emailVerified: true,
        logEntries: {
          none: {
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (usersWithoutLog.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: `Semua pengguna terverifikasi sudah mengisi logbook untuk tanggal ${todayStr}.` 
      });
    }

    // 4. Send email reminder if no entry exists and Resend is configured
    if (!resend) {
      return NextResponse.json({ 
        success: true, 
        message: 'Resend API key is not configured. Email sending is skipped.',
        warning: 'Resend is not configured.',
        totalChecked: usersWithoutLog.length,
        skippedUsers: usersWithoutLog.map(u => ({ email: u.email, fullName: u.fullName }))
      });
    }

    const formattedDate = formatIndonesianDate(startOfDay);
    const results = [];

    // Send emails sequentially to avoid rate limiting and to report individual failures cleanly
    for (const user of usersWithoutLog) {
      try {
        const emailResponse = await resend.emails.send({
          from: emailConfig.from,
          to: user.email,
          subject: '⏰ Pengingat Logbook Magang: Belum ada aktivitas hari ini!',
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">⏰</span>
              </div>
              <h2 style="color: #0f172a; text-align: center; margin-top: 0; font-size: 22px; font-weight: 700;">Sudahkah Anda Mengisi Logbook Hari Ini?</h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                Halo <strong>${user.fullName}</strong>!<br/>
                Kami melihat Anda belum mencatat aktivitas magang untuk hari ini:<br/>
                <strong style="color: #bdbd48; font-size: 17px;">${formattedDate}</strong>.
              </p>
              
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #bdbd48;">
                <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">
                  Menjaga logbook tetap ter-update akan memudahkan Anda melacak akumulasi target magang. Yuk, isi aktivitas Anda sekarang agar tidak lupa rincian pekerjaannya!
                </p>
              </div>
              
              <div style="margin: 32px 0; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="background-color: #bdbd48; color: #0b0f19; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(189, 189, 72, 0.2), 0 2px 4px -2px rgba(189, 189, 72, 0.2); transition: background-color 0.2s;">
                  Isi Logbook Magang
                </a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                Email ini dikirim secara otomatis oleh Sistem Logbook Magang Anda.
              </p>
            </div>
          `,
        });

        results.push({
          email: user.email,
          fullName: user.fullName,
          success: true,
          emailId: emailResponse.data?.id
        });
      } catch (err: any) {
        console.error(`Error sending email to ${user.email}:`, err);
        results.push({
          email: user.email,
          fullName: user.fullName,
          success: false,
          error: err.message || 'Unknown error'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Proses pengiriman email selesai.',
      totalChecked: usersWithoutLog.length,
      sentCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length,
      details: results
    });

  } catch (error: any) {
    console.error('Error in cron reminder API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
