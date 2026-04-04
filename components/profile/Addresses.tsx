'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY_CODE, DEFAULT_COUNTRY_LABEL } from '@/lib/country-options';
import type { AuthAddress, AuthUser } from '@/lib/payload-auth';

type AddressType = 'billing' | 'shipping';

type AddressFormState = {
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
    address: string;
    city: string;
    zip: string;
    companyName: string;
    companyId: string;
    vatId: string;
};

type AddressesProps = {
    user: AuthUser;
};

type AddressSectionProps = {
    title: string;
    type: AddressType;
    value?: AuthAddress;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
};

type AddressFormPanelProps = {
    title: string;
    type: AddressType;
    isSubmitting: boolean;
    successMessage: string;
    errorMessage: string;
    onCancel: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
    form: AddressFormState;
    onChange: (field: keyof AddressFormState, value: string) => void;
};

const emptyAddressForm = (address?: AuthAddress): AddressFormState => ({
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    phone: address?.phone || '',
    country: DEFAULT_COUNTRY_CODE,
    address: address?.address || '',
    city: address?.city || '',
    zip: address?.zip || '',
    companyName: address?.companyName || '',
    companyId: address?.companyId || '',
    vatId: address?.vatId || '',
});

const hasAddressContent = (address?: AuthAddress) =>
    Boolean(
        address &&
            [
                address.firstName,
                address.lastName,
                address.phone,
                address.address,
                address.city,
                address.zip,
                address.companyName,
                address.companyId,
                address.vatId,
            ].some((field) => typeof field === 'string' && field.trim().length > 0),
    );

const formatAddressLines = (address?: AuthAddress) => {
    if (!hasAddressContent(address)) {
        return [];
    }

    const lines = [
        [address?.firstName, address?.lastName].filter(Boolean).join(' ').trim(),
        address?.companyName?.trim() || '',
        address?.address?.trim() || '',
        [address?.zip, address?.city].filter(Boolean).join(' ').trim(),
        DEFAULT_COUNTRY_LABEL,
        address?.phone?.trim() ? `Tel: ${address.phone.trim()}` : '',
        address?.companyId?.trim() ? `IČ: ${address.companyId.trim()}` : '',
        address?.vatId?.trim() ? `DIČ: ${address.vatId.trim()}` : '',
    ];

    return lines.filter((line) => line.length > 0);
};

const inputClassName =
    'w-full rounded-[10px] border border-[#111111]/10 bg-white px-4 py-3 text-[14px] text-[#111111] outline-none transition-colors placeholder:text-[#9d9488] focus:border-[#b98743]';

const AddressSection = ({
    title,
    type,
    value,
    isEditing,
    onEdit,
    onCancel,
}: AddressSectionProps) => {
    const summaryLines = formatAddressLines(value);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-[24px] font-normal">{title}</h3>
                <button
                    type="button"
                    className="text-[#E1B12C] text-[14px] font-medium hover:underline"
                    onClick={isEditing ? onCancel : onEdit}
                >
                    {isEditing ? 'Zavřít' : 'Upravit'}
                </button>
            </div>

            {summaryLines.length ? (
                <div className="space-y-1 text-[15px] leading-7 text-[#4f4a43]">
                    {summaryLines.map((line) => (
                        <p key={`${type}-${line}`}>{line}</p>
                    ))}
                </div>
            ) : (
                <div className="text-[15px] text-gray-500 italic">Dosud jste nenastavili tento typ adresy.</div>
            )}
        </div>
    );
};

const AddressFormPanel = ({
    title,
    type,
    isSubmitting,
    successMessage,
    errorMessage,
    onCancel,
    onSubmit,
    form,
    onChange,
}: AddressFormPanelProps) => {
    const isBilling = type === 'billing';

    return (
        <form className="space-y-4 rounded-[18px] border border-[#111111]/8 bg-[#faf8f4] p-5" onSubmit={onSubmit}>
            <div className="flex items-center justify-between gap-4 border-b border-[#111111]/8 pb-3">
                <h4 className="text-[22px] font-normal text-[#111111]">{title}</h4>
                <button
                    type="button"
                    className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#b98743] transition-colors hover:text-[#8f6934]"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Zavřít
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#3b352e]">Křestní jméno</label>
                    <input
                        type="text"
                        className={inputClassName}
                        value={form.firstName}
                        onChange={(event) => onChange('firstName', event.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#3b352e]">Příjmení</label>
                    <input
                        type="text"
                        className={inputClassName}
                        value={form.lastName}
                        onChange={(event) => onChange('lastName', event.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#3b352e]">Telefon</label>
                    <input
                        type="tel"
                        className={inputClassName}
                        value={form.phone}
                        onChange={(event) => onChange('phone', event.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#3b352e]">Země / region</label>
                    <select
                        className={inputClassName}
                        value={form.country}
                        disabled
                        aria-disabled="true"
                    >
                        {COUNTRY_OPTIONS.map((option) => (
                            <option key={`${type}-${option.value}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="mb-2 block text-[13px] font-medium text-[#3b352e]">Ulice a číslo popisné</label>
                <input
                    type="text"
                    className={inputClassName}
                    value={form.address}
                    onChange={(event) => onChange('address', event.target.value)}
                    disabled={isSubmitting}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#3b352e]">Město</label>
                    <input
                        type="text"
                        className={inputClassName}
                        value={form.city}
                        onChange={(event) => onChange('city', event.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#3b352e]">PSČ</label>
                    <input
                        type="text"
                        className={inputClassName}
                        value={form.zip}
                        onChange={(event) => onChange('zip', event.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            {isBilling ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-[13px] font-medium text-[#3b352e]">Firma</label>
                        <input
                            type="text"
                            className={inputClassName}
                            value={form.companyName}
                            onChange={(event) => onChange('companyName', event.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-[13px] font-medium text-[#3b352e]">IČ</label>
                        <input
                            type="text"
                            className={inputClassName}
                            value={form.companyId}
                            onChange={(event) => onChange('companyId', event.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-[13px] font-medium text-[#3b352e]">DIČ</label>
                        <input
                            type="text"
                            className={inputClassName}
                            value={form.vatId}
                            onChange={(event) => onChange('vatId', event.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            ) : null}

            {successMessage ? <p className="text-[13px] leading-5 text-[#1f6f43]">{successMessage}</p> : null}
            {errorMessage ? <p className="text-[13px] leading-5 text-[#b42318]">{errorMessage}</p> : null}

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#E1B12C] px-6 text-[13px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#c79a24] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Ukládám...' : 'Uložit adresu'}
                </button>
                <button
                    type="button"
                    className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#111111]/10 px-6 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#111111] transition-colors hover:border-[#b98743] hover:text-[#b98743]"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Zrušit
                </button>
            </div>
        </form>
    );
};

const Addresses = ({ user }: AddressesProps) => {
    const router = useRouter();
    const [editingSection, setEditingSection] = useState<AddressType | null>(null);
    const [billingForm, setBillingForm] = useState<AddressFormState>(emptyAddressForm(user.billingAddress));
    const [shippingForm, setShippingForm] = useState<AddressFormState>(emptyAddressForm(user.shippingAddress));
    const [isSubmitting, setIsSubmitting] = useState<AddressType | null>(null);
    const [successMessage, setSuccessMessage] = useState<{ billing: string; shipping: string }>({
        billing: '',
        shipping: '',
    });
    const [errorMessage, setErrorMessage] = useState<{ billing: string; shipping: string }>({
        billing: '',
        shipping: '',
    });

    const resetMessages = (type: AddressType) => {
        setSuccessMessage((prev) => ({ ...prev, [type]: '' }));
        setErrorMessage((prev) => ({ ...prev, [type]: '' }));
    };

    const handleChange = (type: AddressType, field: keyof AddressFormState, value: string) => {
        resetMessages(type);

        if (type === 'billing') {
            setBillingForm((prev) => ({ ...prev, [field]: value }));
            return;
        }

        setShippingForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancel = (type: AddressType) => {
        resetMessages(type);
        setEditingSection((current) => (current === type ? null : current));

        if (type === 'billing') {
            setBillingForm(emptyAddressForm(user.billingAddress));
            return;
        }

        setShippingForm(emptyAddressForm(user.shippingAddress));
    };

    const handleSubmit = async (type: AddressType, event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        resetMessages(type);
        setIsSubmitting(type);

        try {
            const response = await fetch('/api/account/addresses', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    addressType: type,
                    address: type === 'billing' ? billingForm : shippingForm,
                }),
            });

            const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;

            if (!response.ok) {
                setErrorMessage((prev) => ({
                    ...prev,
                    [type]: payload?.error || 'Adresu se nepodařilo uložit.',
                }));
                setIsSubmitting(null);
                return;
            }

            setSuccessMessage((prev) => ({
                ...prev,
                [type]: payload?.message || 'Adresa byla uložena.',
            }));
            setEditingSection(null);
            router.refresh();
        } catch {
            setErrorMessage((prev) => ({
                ...prev,
                [type]: 'Služba pro ukládání adres je momentálně nedostupná.',
            }));
        } finally {
            setIsSubmitting(null);
        }
    };

    const activeType = editingSection;
    const activeTitle = activeType === 'billing' ? 'Fakturační adresa' : 'Doručovací adresa';
    const activeForm = activeType === 'billing' ? billingForm : shippingForm;
    const activeSuccessMessage = activeType === 'billing' ? successMessage.billing : successMessage.shipping;
    const activeErrorMessage = activeType === 'billing' ? errorMessage.billing : errorMessage.shipping;
    const activeIsSubmitting = activeType !== null && isSubmitting === activeType;

    return (
        <div className="space-y-8">
            <p className="text-[15px] leading-relaxed text-gray-600">
                Následující adresy budou použity na stránce pokladny pro výchozí nastavení.
            </p>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                <AddressSection
                    title="Fakturační adresa"
                    type="billing"
                    value={user.billingAddress}
                    isEditing={editingSection === 'billing'}
                    onEdit={() => {
                        resetMessages('billing');
                        setBillingForm(emptyAddressForm(user.billingAddress));
                        setEditingSection('billing');
                    }}
                    onCancel={() => handleCancel('billing')}
                />

                <AddressSection
                    title="Doručovací adresa"
                    type="shipping"
                    value={user.shippingAddress}
                    isEditing={editingSection === 'shipping'}
                    onEdit={() => {
                        resetMessages('shipping');
                        setShippingForm(emptyAddressForm(user.shippingAddress));
                        setEditingSection('shipping');
                    }}
                    onCancel={() => handleCancel('shipping')}
                />
            </div>

            {activeType ? (
                <AddressFormPanel
                    title={activeTitle}
                    type={activeType}
                    isSubmitting={activeIsSubmitting}
                    successMessage={activeSuccessMessage}
                    errorMessage={activeErrorMessage}
                    onCancel={() => handleCancel(activeType)}
                    onSubmit={(event) => handleSubmit(activeType, event)}
                    form={activeForm}
                    onChange={(field, value) => handleChange(activeType, field, value)}
                />
            ) : null}
        </div>
    );
};

export default Addresses;
