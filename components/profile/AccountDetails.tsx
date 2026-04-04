'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/payload-auth';

type AccountDetailsProps = {
    user: AuthUser;
};

type FormState = {
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const inputClassName =
    'w-full rounded-[10px] border border-[#111111]/10 bg-white px-4 py-3 text-[14px] text-[#111111] outline-none transition-colors placeholder:text-[#9d9488] focus:border-[#b98743]';

const AccountDetails = ({ user }: AccountDetailsProps) => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormState>({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.name || user.firstName || '',
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const updateField = (field: keyof FormState, value: string) => {
        setErrorMessage('');
        setSuccessMessage('');
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/account/details', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;

            if (!response.ok) {
                setErrorMessage(payload?.error || 'Nepodařilo se uložit změny účtu.');
                setIsSubmitting(false);
                return;
            }

            setSuccessMessage(payload?.message || 'Změny byly uloženy.');
            setFormData((prev) => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));
            router.refresh();
        } catch {
            setErrorMessage('Služba pro úpravu účtu je momentálně nedostupná.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[900px]">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-[14px] font-medium">
                            Křestní jméno <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={inputClassName}
                            value={formData.firstName}
                            onChange={(event) => updateField('firstName', event.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-[14px] font-medium">
                            Příjmení <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={inputClassName}
                            value={formData.lastName}
                            onChange={(event) => updateField('lastName', event.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-[14px] font-medium">
                        Zobrazované jméno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className={inputClassName}
                        value={formData.displayName}
                        onChange={(event) => updateField('displayName', event.target.value)}
                        disabled={isSubmitting}
                    />
                    <p className="mt-1 text-[13px] italic text-gray-500">
                        Toto jméno bude zobrazeno v uživatelském účtu a u recenzí.
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-[14px] font-medium">
                        E-mailová adresa <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        className={inputClassName}
                        value={formData.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                <fieldset className="space-y-6 rounded-[18px] border border-[#111111]/8 bg-[#faf8f4] p-6">
                    <legend className="px-2 text-[18px] font-medium">Změna hesla</legend>

                    <div>
                        <label className="mb-2 block text-[14px] font-medium">
                            Současné heslo (ponechte prázdné, pokud jej nechcete měnit)
                        </label>
                        <input
                            type="password"
                            className={inputClassName}
                            value={formData.currentPassword}
                            onChange={(event) => updateField('currentPassword', event.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[14px] font-medium">
                            Nové heslo (ponechte prázdné, pokud jej nechcete měnit)
                        </label>
                        <input
                            type="password"
                            className={inputClassName}
                            value={formData.newPassword}
                            onChange={(event) => updateField('newPassword', event.target.value)}
                            disabled={isSubmitting}
                        />
                        <p className="mt-2 text-[12px] text-gray-500">
                            Více než 5 znaků, mezery se nepočítají.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-[14px] font-medium">Potvrdit nové heslo</label>
                        <input
                            type="password"
                            className={inputClassName}
                            value={formData.confirmPassword}
                            onChange={(event) => updateField('confirmPassword', event.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                </fieldset>

                {successMessage ? <p className="text-[13px] leading-5 text-[#1f6f43]">{successMessage}</p> : null}
                {errorMessage ? <p className="text-[13px] leading-5 text-[#b42318]">{errorMessage}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-[50px] items-center justify-center rounded-[12px] bg-[#E1B12C] px-8 text-[14px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#c79a24] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Ukládám změny...' : 'Uložit změny'}
                </button>
            </form>
        </div>
    );
};

export default AccountDetails;
