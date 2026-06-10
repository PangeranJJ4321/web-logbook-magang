import React from 'react';
import { getAllLogEntries, getAllWeeklyReviews } from './actions';
import DashboardWrapper from '@/components/DashboardWrapper';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/utils/auth';
import { redirect } from 'next/navigation';

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
        userFullName={user.fullName}
      />
    </main>
  );
}
