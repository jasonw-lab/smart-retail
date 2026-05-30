import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Login | SmartRetail Pro',
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <h3 className="text-3xl font-bold text-on-surface mb-2">Welcome Back</h3>
        <p className="text-sm text-on-surface-variant">
          Please enter your details to access the dashboard.
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Footer */}
      <div className="pt-6 text-center">
        <p className="text-sm text-on-surface-variant">
          {"Don't have an account? "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
