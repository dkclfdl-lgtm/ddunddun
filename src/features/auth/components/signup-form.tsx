'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import { signupSchema, type SignupFormValues } from '../schema';
import { useAuth } from '../use-auth';

function getPasswordStrength(password: string): {
  level: 'weak' | 'medium' | 'strong';
  label: string;
  color: string;
  width: string;
} {
  if (!password) {
    return { level: 'weak', label: '', color: '', width: 'w-0' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const isLong = password.length >= 12;

  const score = [hasLetter, hasNumber, hasSpecial, isLong].filter(Boolean).length;

  if (score <= 1 || password.length < 8) {
    return { level: 'weak', label: '약함', color: 'bg-red-500', width: 'w-1/3' };
  }
  if (score <= 2) {
    return { level: 'medium', label: '보통', color: 'bg-yellow-500', width: 'w-2/3' };
  }
  return { level: 'strong', label: '강함', color: 'bg-green-500', width: 'w-full' };
}

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      brandName: '',
    },
  });

  const passwordValue = watch('password');
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        brandName: data.brandName,
      });
      router.push(ROUTES.dashboard);
    } catch {
      toast.error('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            type="text"
            placeholder="이름을 입력하세요"
            autoComplete="name"
            {...register('name')}
            className={cn(errors.name && 'border-destructive')}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="이메일을 입력하세요"
            autoComplete="email"
            {...register('email')}
            className={cn(errors.email && 'border-destructive')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력하세요"
              autoComplete="new-password"
              {...register('password')}
              className={cn(errors.password && 'border-destructive')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordValue && (
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    passwordStrength.color,
                    passwordStrength.width
                  )}
                />
              </div>
              <p
                className={cn(
                  'text-xs',
                  passwordStrength.level === 'weak' && 'text-red-500',
                  passwordStrength.level === 'medium' && 'text-yellow-500',
                  passwordStrength.level === 'strong' && 'text-green-500'
                )}
              >
                비밀번호 강도: {passwordStrength.label}
              </p>
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력하세요"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={cn(errors.confirmPassword && 'border-destructive')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandName">
            브랜드명 <span className="text-muted-foreground">(선택)</span>
          </Label>
          <Input
            id="brandName"
            type="text"
            placeholder="브랜드명을 입력하세요"
            {...register('brandName')}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? '가입 중...' : '회원가입'}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{' '}
        <Link
          href={ROUTES.login}
          className="font-medium text-primary hover:underline"
        >
          로그인
        </Link>
      </div>
    </div>
  );
}
