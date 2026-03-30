'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type RegisterApiResponse = {
  error?: string;
  message?: string;
  requiresLogin?: boolean;
};

const RegisterForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as RegisterApiResponse | null;

      if (!response.ok) {
        setErrorMessage(payload?.error || 'Registration failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (payload?.requiresLogin) {
        setSuccessMessage(payload.message || 'Account created. Please sign in.');
        setPassword('');
        setConfirmPassword('');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Account created. You are now signed in.');
      window.location.replace('/my-account');
      return;
    } catch {
      setErrorMessage('Registration service is currently unavailable.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9F9F9] p-8 rounded-sm border border-gray-100">
      <h2 className="text-[32px] font-normal mb-8 leading-tight">Registrace</h2>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="register-first-name" className="block text-[14px] mb-2 font-medium">
              Jmeno
            </label>
            <input
              id="register-first-name"
              type="text"
              autoComplete="given-name"
              className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="register-last-name" className="block text-[14px] mb-2 font-medium">
              Prijmeni
            </label>
            <input
              id="register-last-name"
              type="text"
              autoComplete="family-name"
              className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="block text-[14px] mb-2 font-medium">
            E-mail <span className="text-red-500">*</span>
          </label>
          <input
            id="register-email"
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
          <label htmlFor="register-password" className="block text-[14px] mb-2 font-medium">
            Heslo <span className="text-red-500">*</span>
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
          />
          <p className="mt-2 text-[12px] text-gray-500">
            Vice nez 5 znaku, mezery se nepocitaji.
          </p>
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="block text-[14px] mb-2 font-medium">
            Potvrzeni hesla <span className="text-red-500">*</span>
          </label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            className="w-full bg-white border border-gray-200 h-[50px] px-4 focus:outline-none focus:border-gray-500 rounded-sm"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <p className="text-[14px] text-gray-600 leading-relaxed italic">
          Vytvorenim uctu souhlasite s podminkami zpracovani osobnich udaju dle{' '}
          <Link href="/ochrana-osobnich-udaju" className="underline hover:text-black">
            zasad ochrany osobnich udaju
          </Link>
          .
        </p>

        {errorMessage && (
          <p className="text-[13px] text-red-600" role="alert" aria-live="polite">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="text-[13px] text-emerald-700" role="status" aria-live="polite">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#E1B12C] text-white px-8 h-[50px] font-bold text-[14px] hover:bg-[#c79a24] transition-colors rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'REGISTRUJI...' : 'REGISTROVAT'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
