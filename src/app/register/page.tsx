"use client";

import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Leaf, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

/* ─── Validation Schema ──────────────────────────────── */
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name is too long')
      .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password is too long')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[a-z]/, 'Must include at least one lowercase letter')
      .regex(/[0-9]/, 'Must include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must include at least one special character (!@#$…)'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

/* ─── Password strength helpers ──────────────────────── */
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number (0–9)', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character (!@#$…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function calcStrength(p: string) {
  if (!p) return 0;
  return REQUIREMENTS.filter((r) => r.test(p)).length;
}

/* ─── Page ───────────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password', '');
  const strength = calcStrength(passwordValue);

  const onSubmit = async (data: RegisterFormValues) => {
    setAuthError('');

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: { name: data.name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setAuthError('An account with this email already exists. Try signing in instead.');
        } else if (error.message.includes('rate limit') || error.status === 429) {
          setAuthError('Too many attempts. Please wait a few minutes and try again.');
        } else if (error.message.includes('weak_password') || error.message.includes('password')) {
          setAuthError('Password does not meet security requirements. Please choose a stronger password.');
        } else {
          setAuthError(error.message);
        }
        return;
      }

      // Supabase anti-enumeration: if email already exists with "Confirm email" enabled,
      // signUp returns a fake user object with no identities instead of an error.
      if (signUpData?.user && signUpData.user.identities?.length === 0) {
        setAuthError('An account with this email already exists. Try signing in instead.');
        return;
      }

      setEmailSent(true);
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.');
    }
  };

  /* ── Email-sent confirmation screen ──────────────── */
  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center pt-24 pb-20 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-[#2d5016]/10 border-2 border-[#2d5016]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-[#2d5016]" strokeWidth={1.5} />
          </div>
          <h1 className="font-[Cormorant_Garamond] text-4xl text-[#1c1c1c] mb-3">Check Your Email</h1>
          <p className="text-[#5a5a5a] leading-relaxed mb-6">
            We&apos;ve sent a verification link to your inbox. Click it to activate your account, then sign in.
          </p>
          <div className="bg-white border border-[#ede0cc] p-5 text-[#8a8a8a] text-sm mb-8">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              onClick={() => setEmailSent(false)}
              className="text-[#2d5016] font-semibold hover:underline"
            >
              try again
            </button>
            .
          </div>
          <Link href="/login" className="btn-primary inline-flex justify-center">
            Go to Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ── Registration form ───────────────────────────── */
  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center pt-24 pb-20 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2d5016] mb-5">
            <Leaf className="h-7 w-7 text-[#f5e9c0]" strokeWidth={2} />
          </div>
          <h1 className="font-[Cormorant_Garamond] text-4xl text-[#1c1c1c]">Create Account</h1>
          <p className="text-[#8a8a8a] text-sm mt-2">Join Organic Varam — it takes less than a minute</p>
        </div>

        <div className="bg-white border border-[#ede0cc] shadow-[0_20px_80px_rgba(0,0,0,0.07)] overflow-hidden relative">
          <div className="h-1 bg-gradient-to-r from-[#2d5016] via-[#c9a84c] to-[#2d5016]" />

          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-[#2d5016] mb-3 animate-pulse" strokeWidth={1.5} />
              <p className="font-[Cormorant_Garamond] text-lg text-[#1c1c1c]">Securing your account…</p>
            </div>
          )}

          <div className="px-10 py-10">

            {/* Auth Error */}
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

              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#5a5a5a] mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  {...register('name')}
                  type="text"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`input-premium ${errors.name ? 'error' : ''}`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p id="name-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#5a5a5a] mb-2">
                  Email Address
                </label>
                <input
                  id="reg-email"
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'reg-email-error' : undefined}
                  className={`input-premium ${errors.email ? 'error' : ''}`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p id="reg-email-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#5a5a5a] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    aria-describedby="password-requirements"
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

                {/* Strength bar */}
                {passwordValue && (
                  <div className="mt-3" id="password-requirements">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background: lvl <= strength ? STRENGTH_COLORS[strength] : '#ede0cc',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a8a8a]">Strength</span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: STRENGTH_COLORS[strength] || '#8a8a8a' }}
                      >
                        {STRENGTH_LABELS[strength]}
                      </span>
                    </div>
                    {/* Requirements checklist */}
                    <div className="space-y-1.5">
                      {REQUIREMENTS.map((req) => {
                        const passed = req.test(passwordValue);
                        return (
                          <div key={req.label} className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                                passed ? 'bg-[#22c55e]' : 'bg-[#ede0cc]'
                              }`}
                            >
                              {passed && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-[11px] transition-colors ${passed ? 'text-[#22c55e]' : 'text-[#8a8a8a]'}`}>
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {errors.password && !passwordValue && (
                  <p role="alert" className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#5a5a5a] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    {...register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                    className={`input-premium pr-12 ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#5a5a5a] transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms */}
              <p className="text-[11px] text-[#8a8a8a] leading-relaxed">
                By creating an account you agree to our{' '}
                <span className="text-[#2d5016] font-semibold cursor-pointer hover:underline">Terms of Service</span>
                {' '}and{' '}
                <span className="text-[#2d5016] font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
              </p>

              {/* Submit */}
              <button
                type="submit"
                id="register-submit-btn"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account…' : 'Create Secure Account'}
                {!isSubmitting && <ShieldCheck className="h-4 w-4" />}
              </button>
            </form>

            {/* Security notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[#8a8a8a] text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2d5016]" strokeWidth={1.8} />
              <span>Your data is encrypted and never shared</span>
            </div>

            {/* Sign in link */}
            <div className="mt-6 pt-6 border-t border-[#f0ead8] text-center text-sm text-[#8a8a8a]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#2d5016] font-semibold hover:text-[#c9a84c] transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
