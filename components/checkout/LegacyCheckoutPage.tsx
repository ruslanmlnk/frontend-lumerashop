'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PickupPointSelector from '@/components/checkout/PickupPointSelector';
import { useCart } from '@/context/CartContext';
import {
    formatPickupPointAddress,
    getPickupCarrierForMethod,
    getShippingMethodById,
    SHIPPING_METHODS as SHIPPING_METHODS_CLEAN,
    type CheckoutPickupPoint,
} from '@/lib/checkout-shipping';
import { Check, Truck, CreditCard, User, Receipt, Info, ArrowLeft, Loader2 } from 'lucide-react';
import '@/app/checkout2.css';

type PaymentProvider = 'global-payments' | 'stripe';

type CheckoutStartResponse = {
    provider?: PaymentProvider;
    orderId?: string;
    redirectUrl?: string;
    actionUrl?: string;
    fields?: Record<string, string>;
    error?: string;
};

type Step = 'contact' | 'shipping' | 'billing' | 'payment';

type CheckoutFormState = {
    email: string;
    phone: string;
    createAccount: boolean;
    firstName: string;
    lastName: string;
    country: string;
    address: string;
    city: string;
    zip: string;
    notes: string;
    shippingMethod: ShippingMethodId;
    pickupPoint: CheckoutPickupPoint | null;
    billingSameAsShipping: boolean;
    billingFirstName: string;
    billingLastName: string;
    billingAddress: string;
    billingCity: string;
    billingZip: string;
    isCompany: boolean;
    companyName: string;
    companyId: string;
    vatId: string;
    paymentProvider: PaymentProvider;
    termsAccepted: boolean;
    promoCode: string;
};

type ShippingMethodId =
    | 'ppl-courier-cod'
    | 'ppl-pickup-cod'
    | 'ppl-courier'
    | 'ppl-pickup'
    | 'zasilkovna-courier'
    | 'zasilkovna-pickup'
    | 'personal-pickup';

type ShippingMethod = {
    id: ShippingMethodId;
    label: string;
    price: number;
};

const SHIPPING_METHODS: ShippingMethod[] = [
    { id: 'ppl-courier-cod', label: 'PPL - kurýr na dobírku', price: 0 },
    { id: 'ppl-pickup-cod', label: 'PPL - Výdejní místa na dobírku', price: 0 },
    { id: 'ppl-courier', label: 'PPL - kurýr', price: 0 },
    { id: 'ppl-pickup', label: 'PPL - Výdejní místa', price: 0 },
    { id: 'zasilkovna-courier', label: 'Zásilkovna - kurýr', price: 0 },
    { id: 'zasilkovna-pickup', label: 'Zásilkovna - Výdejní místa', price: 0 },
    { id: 'personal-pickup', label: 'Osobní odběr - Lisabonská 2394, Praha (Výdejní místo)', price: 0 }
];

const DEFAULT_SHIPPING_METHOD = SHIPPING_METHODS[0].id;

const formatShippingPrice = (price: number) => (price === 0 ? 'Zdarma' : `${price.toLocaleString('cs-CZ')} Kč`);

const submitHppForm = (actionUrl: string, fields: Record<string, string>) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;
    form.style.display = 'none';

    for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
};

export default function CheckoutPage() {
    const { cartItems, totalPrice } = useCart();
    const [currentStep, setCurrentStep] = useState<Step>('contact');
    const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<PaymentProvider | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [shippingErrorMessage, setShippingErrorMessage] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CheckoutFormState>({
        email: '',
        phone: '',
        createAccount: false,
        firstName: '',
        lastName: '',
        country: 'CZ',
        address: '',
        city: '',
        zip: '',
        notes: '',
        shippingMethod: DEFAULT_SHIPPING_METHOD,
        pickupPoint: null,
        billingSameAsShipping: true,
        billingFirstName: '',
        billingLastName: '',
        billingAddress: '',
        billingCity: '',
        billingZip: '',
        isCompany: false,
        companyName: '',
        companyId: '', // IČ
        vatId: '', // DIČ
        paymentProvider: 'stripe' as PaymentProvider,
        termsAccepted: false,
        promoCode: ''
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const pickupCarrier = getPickupCarrierForMethod(formData.shippingMethod);

        setFormData((prev) => {
            if (!pickupCarrier && prev.pickupPoint) {
                return { ...prev, pickupPoint: null };
            }

            if (pickupCarrier && prev.pickupPoint && prev.pickupPoint.carrier !== pickupCarrier) {
                return { ...prev, pickupPoint: null };
            }

            return prev;
        });
    }, [formData.shippingMethod]);

    const updateFormData = <K extends keyof CheckoutFormState>(field: K, value: CheckoutFormState[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePickupPointSelect = (pickupPoint: CheckoutPickupPoint) => {
        setShippingErrorMessage(null);
        updateFormData('pickupPoint', pickupPoint);
    };

    const handleContinueFromShipping = () => {
        const pickupCarrier = getPickupCarrierForMethod(formData.shippingMethod);

        if (pickupCarrier && (!formData.pickupPoint || formData.pickupPoint.carrier !== pickupCarrier)) {
            setShippingErrorMessage('Pro tento způsob dopravy musíte vybrat výdejní místo nebo box.');
            return;
        }

        setShippingErrorMessage(null);
        nextStep('shipping', 'billing');
    };

    const nextStep = (step: Step, next: Step) => {
        if (!completedSteps.includes(step)) {
            setCompletedSteps(prev => [...prev, step]);
        }
        setCurrentStep(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToStep = (step: Step) => {
        if (completedSteps.includes(step) || step === 'contact') {
            setCurrentStep(step);
        }
    };

    const handleFinalSubmit = async () => {
        if (!formData.termsAccepted) {
            setErrorMessage('Musíte souhlasit s obchodními podmínkami.');
            return;
        }

        const provider = formData.paymentProvider;
        setErrorMessage(null);

        if (cartItems.length === 0) {
            setErrorMessage('Košík je prázdný. Přidejte produkty před platbou.');
            return;
        }

        try {
            setIsSubmitting(provider);

            const response = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider,
                    items: cartItems,
                    shipping: {
                        methodId: formData.shippingMethod,
                        label: getShippingMethodById(formData.shippingMethod)?.label || formData.shippingMethod,
                        pickupPoint: formData.pickupPoint,
                    },
                    customer: {
                        email: formData.email,
                        phone: formData.phone,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        address: formData.address,
                        city: formData.city,
                        zip: formData.zip,
                        country: formData.country,
                        notes: formData.notes
                    },
                    billing: {
                        sameAsShipping: formData.billingSameAsShipping,
                        isCompany: formData.isCompany,
                        firstName: formData.billingSameAsShipping ? formData.firstName : formData.billingFirstName,
                        lastName: formData.billingSameAsShipping ? formData.lastName : formData.billingLastName,
                        address: formData.billingSameAsShipping ? formData.address : formData.billingAddress,
                        city: formData.billingSameAsShipping ? formData.city : formData.billingCity,
                        zip: formData.billingSameAsShipping ? formData.zip : formData.billingZip,
                        country: formData.country,
                        companyName: formData.companyName,
                        companyId: formData.companyId,
                        vatId: formData.vatId,
                    },
                }),
            });

            const payload = (await response.json()) as CheckoutStartResponse;

            if (!response.ok || payload.error) {
                setErrorMessage(payload.error || 'Nepodařilo se zahájit platbu.');
                return;
            }

            if (provider === 'stripe' && payload.redirectUrl) {
                window.location.href = payload.redirectUrl;
                return;
            }

            if (provider === 'global-payments' && payload.actionUrl && payload.fields) {
                submitHppForm(payload.actionUrl, payload.fields);
                return;
            }

            setErrorMessage('Platební URL nebyla vrácena.');
        } catch {
            setErrorMessage('Došlo k chybě při komunikaci se serverem.');
        } finally {
            setIsSubmitting(null);
        }
    };

    if (!isClient) return null;

    const stepsInfo = [
        { id: 'contact', title: 'Kontakt', icon: User },
        { id: 'shipping', title: 'Přeprava', icon: Truck },
        { id: 'billing', title: 'Fakturace', icon: Receipt },
        { id: 'payment', title: 'Platba', icon: CreditCard }
    ];

    const currentStepIndex = stepsInfo.findIndex(s => s.id === currentStep);
    const progress = ((currentStepIndex + 1) / stepsInfo.length) * 100;
    const selectedShippingMethod = getShippingMethodById(formData.shippingMethod) ?? SHIPPING_METHODS[0];
    const activePickupCarrier = getPickupCarrierForMethod(formData.shippingMethod);
    const shippingPrice = selectedShippingMethod.price;
    const orderTotal = totalPrice + shippingPrice;
    const isCustomerStage = currentStep === 'contact' || currentStep === 'shipping';

    return (
        <div className="flex min-h-screen flex-col bg-[#fdfdfd]">
            <Header />

            <main className="flex-1 pt-[140px] md:pt-[180px] pb-20">
                <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">

                    {/* Progress Header */}
                    <div className="mb-10 text-center">
                        <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#888]">
                            Krok {currentStepIndex + 1} z 4
                        </span>
                        <div className="progress-bar-container mt-4 mx-auto max-w-[400px]">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="checkout-grid">

                        {/* Left Column: Form Steps */}
                        <div className="checkout-main">
                            {isCustomerStage && (
                                <>
                            {/* Step 1: Contact */}
                            <section className={`checkout-step-card ${currentStep === 'contact' ? 'active' : ''}`}>
                                <div className="checkout-step-header" onClick={() => goToStep('contact')}>
                                    <div className={`step-number ${completedSteps.includes('contact') ? 'bg-green-500' : ''}`}>
                                        {completedSteps.includes('contact') ? <Check size={16} /> : 1}
                                    </div>
                                    <h2 className="step-title">Můj Kontakt</h2>
                                </div>

                                {currentStep === 'contact' ? (
                                    <div className="mt-6 animate-fadeIn">
                                        <div className="checkout-input-group">
                                            <label className="checkout-label">E-mailová adresa *</label>
                                            <input
                                                type="email"
                                                className="checkout-input"
                                                placeholder="vase@adresa.cz"
                                                value={formData.email}
                                                onChange={(e) => updateFormData('email', e.target.value)}
                                            />
                                            <p className="mt-2 text-[12px] text-[#888]">
                                                Na tuto e-mailovou adresu bude zasláno číslo objednávky a potvrzení o přijetí.
                                            </p>
                                        </div>
                                        <div className="checkout-input-group">
                                            <label className="checkout-label">Přepravní telefon *</label>
                                            <input
                                                type="tel"
                                                className="checkout-input"
                                                placeholder="+420 123 456 789"
                                                value={formData.phone}
                                                onChange={(e) => updateFormData('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="checkout-input-group mt-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-[#f1c50e]"
                                                    checked={formData.createAccount}
                                                    onChange={(e) => updateFormData('createAccount', e.target.checked)}
                                                />
                                                <span className="text-[14px]">Vytvořit účet? (volitelný)</span>
                                            </label>
                                        </div>
                                        <button
                                            className="checkout-button-primary mt-6"
                                            onClick={() => nextStep('contact', 'shipping')}
                                            disabled={!formData.email || !formData.phone}
                                        >
                                            Pokračovat k přepravě
                                        </button>
                                    </div>
                                ) : (
                                    completedSteps.includes('contact') && (
                                        <div className="text-[14px] text-[#666]">
                                            {formData.email} | {formData.phone}
                                        </div>
                                    )
                                )}
                            </section>

                            {/* Step 2: Shipping */}
                            <section className={`checkout-step-card ${currentStep === 'shipping' ? 'active' : ''}`}>
                                <div className="checkout-step-header" onClick={() => goToStep('shipping')}>
                                    <div className={`step-number ${completedSteps.includes('shipping') ? 'bg-green-500' : ''}`}>
                                        {completedSteps.includes('shipping') ? <Check size={16} /> : 2}
                                    </div>
                                    <h2 className="step-title">Přeprava</h2>
                                </div>

                                {currentStep === 'shipping' ? (
                                    <div className="mt-6 animate-fadeIn">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="checkout-input-group">
                                                <label className="checkout-label">Jméno *</label>
                                                <input
                                                    type="text"
                                                    className="checkout-input"
                                                    value={formData.firstName}
                                                    onChange={(e) => updateFormData('firstName', e.target.value)}
                                                />
                                            </div>
                                            <div className="checkout-input-group">
                                                <label className="checkout-label">Příjmení *</label>
                                                <input
                                                    type="text"
                                                    className="checkout-input"
                                                    value={formData.lastName}
                                                    onChange={(e) => updateFormData('lastName', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="checkout-input-group">
                                            <label className="checkout-label">Země *</label>
                                            <select
                                                className="checkout-input bg-white appearance-none"
                                                value={formData.country}
                                                onChange={(e) => updateFormData('country', e.target.value)}
                                            >
                                                <option value="CZ">Česká republika</option>
                                                <option value="SK">Slovensko</option>
                                            </select>
                                        </div>
                                        <div className="checkout-input-group">
                                            <label className="checkout-label">Ulice a číslo popisné *</label>
                                            <input
                                                type="text"
                                                className="checkout-input"
                                                value={formData.address}
                                                onChange={(e) => updateFormData('address', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="checkout-input-group">
                                                <label className="checkout-label">Město *</label>
                                                <input
                                                    type="text"
                                                    className="checkout-input"
                                                    value={formData.city}
                                                    onChange={(e) => updateFormData('city', e.target.value)}
                                                />
                                            </div>
                                            <div className="checkout-input-group">
                                                <label className="checkout-label">PSČ *</label>
                                                <input
                                                    type="text"
                                                    className="checkout-input"
                                                    value={formData.zip}
                                                    onChange={(e) => updateFormData('zip', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="checkout-input-group">
                                            <label className="checkout-label">Poznámka k objednávce (volitelně)</label>
                                            <textarea
                                                className="checkout-input h-[100px] py-3 resize-none"
                                                value={formData.notes}
                                                onChange={(e) => updateFormData('notes', e.target.value)}
                                                placeholder="Máte nějaké speciální přání?"
                                            />
                                        </div>

                                        <h3 className="mt-8 mb-4 text-[14px] font-bold uppercase tracking-wider text-[#111]">Metoda přepravy</h3>
                                        {false && (<>
                                        <div
                                            className={`shipping-option ${formData.shippingMethod === 'ppl-courier-cod' ? 'selected' : ''}`}
                                            onClick={() => updateFormData('shippingMethod', 'ppl-courier-cod')}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.shippingMethod === 'ppl-courier-cod' ? 'border-[#f1c50e]' : 'border-gray-300'}`}>
                                                {formData.shippingMethod === 'ppl-courier-cod' && <div className="w-2.5 h-2.5 rounded-full bg-[#f1c50e]" />}
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold block">PPL - Doručení na adresu</span>
                                                <span className="text-[12px] text-[#888]">Standardní doručení do 24/48 hodin</span>
                                            </div>
                                            <span className="font-bold">99 Kč</span>
                                        </div>
                                        <div
                                            className={`shipping-option ${formData.shippingMethod === 'zasilkovna-pickup' ? 'selected' : ''}`}
                                            onClick={() => updateFormData('shippingMethod', 'zasilkovna-pickup')}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.shippingMethod === 'zasilkovna-pickup' ? 'border-[#f1c50e]' : 'border-gray-300'}`}>
                                                {formData.shippingMethod === 'zasilkovna-pickup' && <div className="w-2.5 h-2.5 rounded-full bg-[#f1c50e]" />}
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold block">Zásilkovna - Výdejní místo</span>
                                                <span className="text-[12px] text-[#888]">Doručení na vybrané výdejní místo</span>
                                            </div>
                                            <span className="font-bold">79 Kč</span>
                                        </div>
                                        </>)}

                                        {SHIPPING_METHODS_CLEAN.map((method) => {
                                            const isSelected = formData.shippingMethod === method.id;

                                            return (
                                                <div
                                                    key={method.id}
                                                    className={`shipping-option items-start ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setShippingErrorMessage(null);
                                                        updateFormData('shippingMethod', method.id);
                                                    }}
                                                >
                                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#f1c50e]' : 'border-gray-300'}`}>
                                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#f1c50e]" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="block font-semibold leading-snug">{method.label}</span>
                                                    </div>
                                                    <span className="shrink-0 font-bold text-right">{formatShippingPrice(method.price)}</span>
                                                </div>
                                            );
                                        })}

                                        {activePickupCarrier && (
                                            <div className="mt-4">
                                                <PickupPointSelector
                                                    shippingMethodId={formData.shippingMethod}
                                                    country={formData.country}
                                                    selectedPoint={formData.pickupPoint}
                                                    onSelect={handlePickupPointSelect}
                                                />
                                            </div>
                                        )}

                                        {shippingErrorMessage && (
                                            <p className="checkout-inline-error mt-4">{shippingErrorMessage}</p>
                                        )}

                                        <button
                                            className="checkout-button-primary mt-6"
                                            onClick={handleContinueFromShipping}
                                            disabled={!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.zip}
                                        >
                                            Pokračovat k fakturaci
                                        </button>
                                    </div>
                                ) : (
                                    completedSteps.includes('shipping') && (
                                        <div className="text-[14px] text-[#666]">
                                            <div>{formData.firstName} {formData.lastName}, {formData.address}, {formData.city} {formData.zip}</div>
                                            <div className="mt-1 text-[13px] text-[#888]">{selectedShippingMethod.label}</div>
                                            {formData.pickupPoint && activePickupCarrier && (
                                                <div className="mt-2 text-[12px] text-[#666]">
                                                    <div className="font-medium text-[#111]">{formData.pickupPoint.name}</div>
                                                    <div className="mt-1 text-[#888]">
                                                        {formatPickupPointAddress(formData.pickupPoint)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </section>
                                </>
                            )}

                            {!isCustomerStage && (
                                <>
                                    <div className="mb-6 flex justify-start">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#111] transition-colors hover:border-[#f1c50e]"
                                            onClick={() => goToStep('shipping')}
                                        >
                                            <ArrowLeft size={14} />
                                            Zpět na kontakt a dopravu
                                        </button>
                                    </div>
                            {/* Step 3: Billing */}
                            <section className={`checkout-step-card ${currentStep === 'billing' ? 'active' : ''}`}>
                                <div className="checkout-step-header" onClick={() => goToStep('billing')}>
                                    <div className={`step-number ${completedSteps.includes('billing') ? 'bg-green-500' : ''}`}>
                                        {completedSteps.includes('billing') ? <Check size={16} /> : 3}
                                    </div>
                                    <h2 className="step-title">Fakturace</h2>
                                </div>

                                {currentStep === 'billing' ? (
                                    <div className="mt-6 animate-fadeIn">
                                        <label className="flex items-center gap-3 p-4 border border-[#e5e7eb] rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-[#f1c50e]"
                                                checked={formData.billingSameAsShipping}
                                                onChange={(e) => updateFormData('billingSameAsShipping', e.target.checked)}
                                            />
                                            <span className="text-[14px] font-medium">Fakturační adresa stejná jako doručovací</span>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 mt-3 border border-[#e5e7eb] rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-[#f1c50e]"
                                                checked={formData.isCompany}
                                                onChange={(e) => updateFormData('isCompany', e.target.checked)}
                                            />
                                            <span className="text-[14px] font-medium">Nakupuji na firmu</span>
                                        </label>

                                        {formData.isCompany && (
                                            <div className="mt-6 pt-6 border-t border-[#e5e7eb] animate-fadeIn">
                                                <div className="checkout-input-group">
                                                    <label className="checkout-label">Název firmy *</label>
                                                    <input type="text" className="checkout-input" value={formData.companyName} onChange={(e) => updateFormData('companyName', e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="checkout-input-group">
                                                        <label className="checkout-label">IČ *</label>
                                                        <input type="text" className="checkout-input" value={formData.companyId} onChange={(e) => updateFormData('companyId', e.target.value)} />
                                                    </div>
                                                    <div className="checkout-input-group">
                                                        <label className="checkout-label">DIČ (pokud jste plátci)</label>
                                                        <input type="text" className="checkout-input" value={formData.vatId} onChange={(e) => updateFormData('vatId', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!formData.billingSameAsShipping && (
                                            <div className="mt-6 pt-6 border-t border-[#e5e7eb] animate-fadeIn">
                                                <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wider text-[#111]">Vlastní fakturační adresa</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="checkout-input-group">
                                                        <label className="checkout-label">Jméno *</label>
                                                        <input type="text" className="checkout-input" value={formData.billingFirstName} onChange={(e) => updateFormData('billingFirstName', e.target.value)} />
                                                    </div>
                                                    <div className="checkout-input-group">
                                                        <label className="checkout-label">Příjmení *</label>
                                                        <input type="text" className="checkout-input" value={formData.billingLastName} onChange={(e) => updateFormData('billingLastName', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="checkout-input-group">
                                                    <label className="checkout-label">Ulice a číslo *</label>
                                                    <input type="text" className="checkout-input" value={formData.billingAddress} onChange={(e) => updateFormData('billingAddress', e.target.value)} />
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            className="checkout-button-primary mt-6"
                                            onClick={() => nextStep('billing', 'payment')}
                                        >
                                            Pokračovat k platbě
                                        </button>
                                    </div>
                                ) : (
                                    completedSteps.includes('billing') && (
                                        <div className="text-[14px] text-[#666]">
                                            {formData.billingSameAsShipping ? 'Stejná jako doručovací' : 'Vlastní fakturační adresa'}
                                        </div>
                                    )
                                )}
                            </section>

                            {/* Step 4: Payment */}
                            <section className={`checkout-step-card ${currentStep === 'payment' ? 'active' : ''}`}>
                                <div className="checkout-step-header" onClick={() => goToStep('payment')}>
                                    <div className={`step-number ${completedSteps.includes('payment') ? 'bg-green-500' : ''}`}>
                                        {completedSteps.includes('payment') ? <Check size={16} /> : 4}
                                    </div>
                                    <h2 className="step-title">Platba</h2>
                                </div>

                                {currentStep === 'payment' ? (
                                    <div className="mt-6 animate-fadeIn">
                                        <div className="mb-8">
                                            <label className="checkout-label">Máte dárkový kupón?</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    className="checkout-input"
                                                    placeholder="Kód kupónu"
                                                    value={formData.promoCode}
                                                    onChange={(e) => updateFormData('promoCode', e.target.value)}
                                                />
                                                <button className="px-6 border border-[#111] font-semibold text-[13px] hover:bg-black hover:text-white transition-colors">
                                                    POUŽÍT
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wider text-[#111]">Platební metoda</h3>
                                        <div className="space-y-4">
                                            <div
                                                className={`shipping-option ${formData.paymentProvider === 'stripe' ? 'selected' : ''}`}
                                                onClick={() => updateFormData('paymentProvider', 'stripe')}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentProvider === 'stripe' ? 'border-[#f1c50e]' : 'border-gray-300'}`}>
                                                    {formData.paymentProvider === 'stripe' && <div className="w-2.5 h-2.5 rounded-full bg-[#f1c50e]" />}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CreditCard size={20} className="text-[#6b7280]" />
                                                    <div>
                                                        <span className="font-semibold block">Online karta / Apple Pay (Stripe)</span>
                                                        <span className="text-[12px] text-[#888]">Bezpečné okamžité doručení</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`shipping-option ${formData.paymentProvider === 'global-payments' ? 'selected' : ''}`}
                                                onClick={() => updateFormData('paymentProvider', 'global-payments')}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentProvider === 'global-payments' ? 'border-[#f1c50e]' : 'border-gray-300'}`}>
                                                    {formData.paymentProvider === 'global-payments' && <div className="w-2.5 h-2.5 rounded-full bg-[#f1c50e]" />}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CreditCard size={20} className="text-[#6b7280]" />
                                                    <div>
                                                        <span className="font-semibold block">Global Payments (GP webpay)</span>
                                                        <span className="text-[12px] text-[#888]">Tradiční evropská platební brána</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 space-y-4">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 w-5 h-5 accent-[#f1c50e]"
                                                    checked={formData.termsAccepted}
                                                    onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                                                />
                                                <span className="text-[13px] text-[#666]">
                                                    Souhlasím s <Link href="/obchodni-podminky" className="underline hover:text-black">obchodními podmínkami</Link> a <Link href="/ochrana-osobnich-udaju" className="underline hover:text-black">ochranou osobních údajů</Link>. *
                                                </span>
                                            </label>
                                        </div>

                                        {errorMessage && <p className="mt-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded text-[14px]">{errorMessage}</p>}

                                        <button
                                            className="checkout-button-primary mt-8 py-5 h-auto"
                                            onClick={handleFinalSubmit}
                                            disabled={isSubmitting !== null}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Přesměrování...
                                                </span>
                                            ) : (
                                                'OBJEDNAT A ZAPLATIT'
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    completedSteps.includes('payment') && (
                                        <div className="text-[14px] text-[#666]">
                                            {formData.paymentProvider === 'stripe' ? 'Stripe' : 'Global Payments'}
                                        </div>
                                    )
                                )}
                            </section>
                                </>
                            )}
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="checkout-sidebar">
                            <aside className="order-summary-card">
                                <h2 className="summary-title">Přehled objednávky</h2>

                                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="summary-item flex items-start gap-3 text-[14px]">
                                            <div className="relative w-[60px] h-[60px] bg-white border border-[#eee] rounded-md overflow-hidden flex-shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                <div className="absolute top-[-5px] right-[-5px] bg-[#111] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-[#111] leading-[1.3]">{item.name}</p>
                                                <p className="text-[#888] mt-1 text-[12px]">{item.variant || item.sku}</p>
                                            </div>
                                            <p className="font-semibold text-[#111]">{(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-6 border-t border-[#e5e7eb]">
                                    <div className="summary-item leading-snug">
                                        <span>Mezisoučet</span>
                                        <span>{totalPrice.toLocaleString('cs-CZ')} Kč</span>
                                    </div>
                                    {false && (<>
                                    <div className="summary-item leading-snug">
                                        <span>Doprava</span>
                                        <span>{formData.shippingMethod === 'ppl-courier-cod' ? '99 Kč' : '79 Kč'}</span>
                                    </div>
                                    <div className="summary-total mt-4 pt-4 border-t border-[#111]/10">
                                        <span>CELKEM</span>
                                        <span className="text-[22px]">
                                            {(totalPrice + (formData.shippingMethod === 'ppl-courier-cod' ? 99 : 79)).toLocaleString('cs-CZ')} Kč
                                        </span>
                                    </div>
                                </>)}
                                    <div className="summary-item leading-snug">
                                        <div className="pr-4">
                                            <span className="block">Doprava</span>
                                            <span className="block text-[12px] text-[#888]">{selectedShippingMethod.label}</span>
                                            {formData.pickupPoint && activePickupCarrier && (
                                                <span className="mt-1 block text-[12px] text-[#666]">
                                                    {formData.pickupPoint.name}
                                                    {formatPickupPointAddress(formData.pickupPoint)
                                                        ? `, ${formatPickupPointAddress(formData.pickupPoint)}`
                                                        : ''}
                                                </span>
                                            )}
                                        </div>
                                        <span>{formatShippingPrice(shippingPrice)}</span>
                                    </div>
                                    <div className="summary-total mt-4 pt-4 border-t border-[#111]/10">
                                        <span>CELKEM</span>
                                        <span className="text-[22px]">
                                            {orderTotal.toLocaleString('cs-CZ')} Kč
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center gap-3 text-[12px] text-[#888] bg-white p-4 rounded-lg border border-[#eee]">
                                    <Info size={16} className="text-[#f1c50e]" />
                                    <p>Všechny uvedené ceny jsou vč. DPH 21%.</p>
                                </div>

                                <div className="mt-6">
                                    <Link
                                        href="/shop"
                                        className="flex items-center justify-center gap-2 text-[13px] font-semibold text-[#888] hover:text-black transition-colors"
                                    >
                                        <ArrowLeft size={14} />
                                        Pokračovat v nákupu
                                    </Link>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
