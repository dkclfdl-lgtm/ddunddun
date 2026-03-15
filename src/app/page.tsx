'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROUTES } from '@/constants';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.dashboard);
  }, [router]);

  return null;
}
