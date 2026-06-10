import React from 'react';
import { getAllLogEntries, getAllWeeklyReviews } from './actions';
import DashboardWrapper from '@/components/DashboardWrapper';

// Forces Next.js to dynamically fetch data on request rather than caching static HTML build-time page
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch entries and reviews from Postgres in parallel on the server
  const [entries, reviews] = await Promise.all([
    getAllLogEntries(),
    getAllWeeklyReviews(),
  ]);

  return (
    <main>
      <DashboardWrapper
        initialEntries={entries}
        initialReviews={reviews}
      />
    </main>
  );
}
