import React from 'react';
import { getAllLogEntries, getAllWeeklyReviews } from './actions';
import DashboardWrapper from '@/components/DashboardWrapper';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/utils/prisma';
import { toISODateString } from '@/utils/dateHelpers';

export const dynamic = 'force-dynamic';

export default async function Home() {
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

  // Fetch complete user profile from database
  const userProfile = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      fullName: true,
      targetHours: true,
      internshipStart: true,
      internshipEnd: true,
    }
  });

  if (!userProfile) {
    redirect('/login');
  }

  // 2. Fetch entries and reviews (automatically scoped to the user session inside Server Actions)
  const [entries, reviews] = await Promise.all([
    getAllLogEntries(),
    getAllWeeklyReviews(),
  ]);

  return (
    <main>
      <DashboardWrapper
        initialEntries={entries}
        initialReviews={reviews}
        userFullName={userProfile.fullName}
        targetHours={userProfile.targetHours}
        internshipStart={toISODateString(userProfile.internshipStart)}
        internshipEnd={toISODateString(userProfile.internshipEnd)}
      />
    </main>
  );
}
