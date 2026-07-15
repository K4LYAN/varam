"use client";

import { useState, Suspense } from 'react';
import { Eye, EyeOff, Lock, ArrowRight, Leaf, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

/* ─── Validation Schema ──────────────────────────────── */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/* ─── Inner component (uses useSearchParams) ─────────── */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Whitelist of allowed redirect targets to prevent open redirect attacks
  const SAFE_REDIRECTS = new Set(['/profile', '/checkout', '/cart', '/shop', '/order-success', '/']);
  const rawRedirect = searchParams?.get('redirect') ?? '/profile';
  const redirect = SAFE_REDIRECTS.has(rawRedirect) ? rawRedirect : '/profile';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (error) {
      // Map Supabase errors to friendly messages
      if (error.message.includes('Invalid login credentials')) {
        setAuthError('Incorrect email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setAuthError('Please verify your email address before signing in. Check your inbox.');
      } else {
        setAuthError(error.message);
      }
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">

      {/* Logo mark */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2d5016] mb-5">
          <Leaf className="h-7 w-7 text-[#f5e9c0]" strokeWidth={2} />
        </div>
        <h1 className="font-[Cormorant_Garamond] text-4xl text-[#1c1c1c]">Welcome Back</h1>
        <p className="text-[#8a8a8a] text-sm mt-2">Sign in to your Organic Varam account</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-[#ede0cc] shadow-[0_20px_80px_rgba(0,0,0,0.07)] overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-[#2d5016] via-[#c9a84c] to-[#2d5016]" />

        {/* Loading overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-sm">
            <Lock className="h-8 w-8 text-[#2d5016] mb-3 animate-pulse" strokeWidth={1.5} />
            <p className="font-[Cormorant_Garamond] text-lg text-[#1c1c1c]">Authenticating…</p>
          </div>
        )}

        <div className="px-10 py-10 relative">

          {/* Auth Error Banner */}
          {authError && (
            <div
              role="alert"
              className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 px-4 py-3 mb-6 text-red-700 text-sm animate-fadeInUp"
            >
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#5a5a5a] mb-2">
                Email Address
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`input-premium ${errors.email ? 'error' : ''}`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p id="email-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#5a5a5a]">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[10px] text-[#c9a84c] hover:text-[#a8872a] hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`input-premium pr-12 ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#5a5a5a] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing In…' : 'Sign In Securely'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#f0ead8]" />
            <span className="text-[10px] tracking-widest uppercase text-[#c9a84c] font-semibold">Secure Login</span>
            <div className="h-px flex-1 bg-[#f0ead8]" />
          </div>

          {/* Security notice */}
          <div className="flex items-center justify-center gap-2 text-[#8a8a8a] text-[11px] mb-6">
            <ShieldCheck className="h-3.5 w-3.5 text-[#2d5016]" strokeWidth={1.8} />
            <span>Your data is encrypted and never shared</span>
          </div>

          {/* Register link */}
          <div className="text-center text-sm text-[#8a8a8a]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#2d5016] font-semibold hover:text-[#c9a84c] transition-colors">
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page wrapper (Suspense for useSearchParams) ─────── */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center pt-24 pb-20 px-4">
      <Suspense fallback={<div className="w-full max-w-md h-96 bg-white border border-[#ede0cc] animate-pulse rounded" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
