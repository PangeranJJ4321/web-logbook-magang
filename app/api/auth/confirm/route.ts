import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find user by verificationToken
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    // If user is not found, token is invalid
    if (!user) {
      return NextResponse.json({ error: 'Tautan konfirmasi tidak valid atau telah kedaluwarsa.' }, { status: 400 });
    }

    // Check if token has expired
    if (user.verificationTokenExpires && new Date() > new Date(user.verificationTokenExpires)) {
      return NextResponse.json({ error: 'Tautan konfirmasi telah kedaluwarsa.' }, { status: 400 });
    }

    // Update emailVerified to true, and clear verification token fields
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    // Redirect to login page with confirmed success query parameter
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/login?confirmed=true`);
  } catch (error) {
    console.error('Error confirming email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
