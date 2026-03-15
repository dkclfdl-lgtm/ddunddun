'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.settingsProfile);
  }, [router]);

  return null;
}
