'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { APP_NAME } from '@/constants';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[420px] border-border shadow-lg">
        <CardHeader className="items-center space-y-4 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-xl font-bold text-primary-foreground">T</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              비밀번호를 재설정합니다
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
