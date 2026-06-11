import React from 'react';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/utils/prisma';
import { toISODateString } from '@/utils/dateHelpers';
import SettingsForm from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  // 1. Resolve user session from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const user = await verifyJWT(token);
  if (!user) {
    redirect('/login');
  }

  // 2. Fetch complete user profile from database
  const userProfile = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      fullName: true,
      targetHours: true,
      internshipStart: true,
      internshipEnd: true,
      sendReminders: true,
    }
  });

  if (!userProfile) {
    redirect('/login');
  }

  const initialData = {
    fullName: userProfile.fullName,
    targetHours: userProfile.targetHours,
    internshipStart: toISODateString(userProfile.internshipStart),
    internshipEnd: toISODateString(userProfile.internshipEnd),
    sendReminders: userProfile.sendReminders,
  };

  return (
    <main>
      <SettingsForm initialData={initialData} />
    </main>
  );
}
