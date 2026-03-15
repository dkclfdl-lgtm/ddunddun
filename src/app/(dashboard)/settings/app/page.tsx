'use client';

import { useAppSettings } from '@/features/settings/hooks';
import { ThemeToggle } from '@/features/settings/components/theme-toggle';
import { NotificationPreferences } from '@/features/settings/components/notification-preferences';

export default function AppSettingsPage() {
  const { settings, updateTheme, updateNotificationPreference } = useAppSettings();

  return (
    <div className="space-y-6">
      <ThemeToggle theme={settings.theme} onThemeChange={updateTheme} />
      <NotificationPreferences
        notifications={settings.notifications}
        onPreferenceChange={updateNotificationPreference}
      />
    </div>
  );
}
