'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type LoginApiResponse = {
  error?: string;
};

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          remember,
        }),
      });

      const payload = (await response.json().catch(() => null)) as LoginApiResponse | null;

      if (!response.ok) {
        setErrorMessage(payload?.error || 'Login failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      window.location.replace('/my-account');
      return;
    } catch {
      setErrorMessage('Login service is currently unavailable.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9F9F9] p-8 rounded-sm border border-gray-100">
      <h2 className="text-[32px] font-normal mb-8 leading-tight">Prihlaseni</h2>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <label htmlFor="login-email" className="block text-[14px] mb-2 font-medium">
            E-mail <span className="text-red-500">*</span>
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-[14px] mb-2 font-medium">
            Heslo <span className="text-red-500">*</span>
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 border-gray-300 rounded"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            disabled={isSubmitting}
          />
          <label htmlFor="remember" className="text-[14px]">
            Zapamatovat si me
          </label>
        </div>

        {errorMessage && (
          <p className="text-[13px] text-red-600" role="alert" aria-live="polite">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#E1B12C] text-white px-8 h-[50px] font-bold text-[14px] hover:bg-[#c79a24] transition-colors rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'PRIHLASUJI...' : 'PRIHLASIT SE'}
        </button>

        <div className="pt-2">
          <Link href="#" className="text-[14px] text-gray-500 hover:text-black transition-colors underline underline-offset-4">
            Zapomneli jste heslo?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
