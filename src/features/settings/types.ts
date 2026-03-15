export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  language: string;
  timezone: string;
}

export interface BrandSettings {
  name: string;
  logoUrl: string;
  businessNumber: string;
  representative: string;
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  description: string;
}

export type FeatureAction = 'view' | 'create' | 'edit' | 'delete';

export interface PermissionRole {
  role: string;
  permissions: Record<string, FeatureAction[]>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    sales: NotificationPreferences;
    inventory: NotificationPreferences;
    inspection: NotificationPreferences;
    review: NotificationPreferences;
    staff: NotificationPreferences;
    system: NotificationPreferences;
  };
  defaultStore: string;
}
