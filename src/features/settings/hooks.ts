'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ProfileSettings, BrandSettings, PermissionRole, AppSettings, FeatureAction } from './types';
import {
  mockProfileSettings,
  mockBrandSettings,
  mockPermissions,
  mockAppSettings,
} from './mock';
import { profileFormSchema, brandFormSchema, type ProfileFormValues, type BrandFormValues } from './schema';

export function useProfileSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<ProfileSettings>(mockProfileSettings);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profile,
  });

  const saveProfile = useCallback(
    async (data: ProfileFormValues): Promise<void> => {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        language: data.language,
        timezone: data.timezone,
      });
      setIsSubmitting(false);
    },
    [],
  );

  return { profile, form, isSubmitting, saveProfile };
}

export function useBrandSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brand, setBrand] = useState<BrandSettings>(mockBrandSettings);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: brand,
  });

  const saveBrand = useCallback(
    async (data: BrandFormValues): Promise<void> => {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setBrand({
        name: data.name,
        logoUrl: data.logoUrl,
        businessNumber: data.businessNumber,
        representative: data.representative,
        phone: data.phone,
        email: data.email,
        address: data.address,
        businessHours: data.businessHours,
        description: data.description,
      });
      setIsSubmitting(false);
    },
    [],
  );

  return { brand, form, isSubmitting, saveBrand };
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionRole[]>(mockPermissions);

  const togglePermission = useCallback(
    (role: string, feature: string, action: FeatureAction) => {
      setPermissions((prev) =>
        prev.map((p) => {
          if (p.role !== role) return p;

          const currentActions = p.permissions[feature] ?? [];
          const hasAction = currentActions.includes(action);
          const newActions = hasAction
            ? currentActions.filter((a) => a !== action)
            : [...currentActions, action];

          return {
            ...p,
            permissions: {
              ...p.permissions,
              [feature]: newActions,
            },
          };
        }),
      );
    },
    [],
  );

  return { permissions, togglePermission };
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(mockAppSettings);

  const updateTheme = useCallback((theme: AppSettings['theme']) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const updateNotificationPreference = useCallback(
    (category: keyof AppSettings['notifications'], channel: 'email' | 'push' | 'sms', value: boolean) => {
      setSettings((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [category]: {
            ...prev.notifications[category],
            [channel]: value,
          },
        },
      }));
    },
    [],
  );

  const updateDefaultStore = useCallback((storeId: string) => {
    setSettings((prev) => ({ ...prev, defaultStore: storeId }));
  }, []);

  return { settings, updateTheme, updateNotificationPreference, updateDefaultStore };
}
