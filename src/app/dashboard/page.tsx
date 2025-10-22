"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is obsolete because the main page is now the dashboard.
// We redirect to the root page to avoid users landing here from old links.
export default function DashboardPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null; // Render nothing while redirecting
}
