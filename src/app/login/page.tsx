"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is obsolete because the app now logs in anonymously automatically.
// We redirect to the root page to avoid users landing here from old links.
export default function LoginPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null; // Render nothing while redirecting
}
