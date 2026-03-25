'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Truck, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutEmptyState from '@/components/checkout/CheckoutEmptyState';
import CheckoutHero from '@/components/checkout/CheckoutHero';
import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import PickupPointSelector from '@/components/checkout/PickupPointSelector';
import { cn, getCheckoutTheme } from '@/components/checkout/theme';
import type {
    CheckoutFormState,
    CheckoutQuoteResponse,
    CheckoutStartResponse,
    CheckoutVariant,
    PaymentProvider,
    Step,
} from '@/components/checkout/types';
import { useCart } from '@/context/CartContext';
import { DEFAULT_COUNTRY_CODE } from '@/lib/country-options';
import type { AuthUser } from '@/lib/payload-auth';
import {
    PENDING_COUPON_EVENT,
    clearPendingCoupon,
    persistPendingCoupon,
    readPendingCoupon,
    sanitizeCouponCode,
} from '@/lib/coupon-storage';
import {
    formatPickupPointAddress,
    getPickupCarrierForMethod,
    getShippingMethodById,
    SHIPPING_METHODS,
    type ShippingMethod,
} from '@/lib/checkout-shipping';

const formatPrice = (value: number) =>
    `${value.toLocaleString('cs-CZ', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    })} Kč`;

const hasSavedAddressData = (
    address:
        | {
              firstName?: string;
              lastName?: string;
              phone?: string;
              address?: string;
              city?: string;
              zip?: string;
              companyName?: string;
              companyId?: string;
              vatId?: string;
          }
        | undefined,
) =>
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

const areSavedAddressesEquivalent = (
    left:
        | {
              firstName?: string;
              lastName?: string;
              phone?: string;
              country?: string;
              address?: string;
              city?: string;
              zip?: string;
          }
        | undefined,
    right:
        | {
              firstName?: string;
              lastName?: string;
              phone?: string;
              country?: string;
              address?: string;
              city?: string;
              zip?: string;
          }
        | undefined,
) =>
    ['firstName', 'lastName', 'phone', 'country', 'address', 'city', 'zip'].every((key) => {
        const leftValue = typeof left?.[key as keyof typeof left] === 'string' ? left[key as keyof typeof left] : '';
        const rightValue = typeof right?.[key as keyof typeof right] === 'string' ? right[key as keyof typeof right] : '';
        return (leftValue || '').trim() === (rightValue || '').trim();
    });

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

const getPaymentLabel = (provider: PaymentProvider) =>
    provider === 'stripe' ? 'Online karta / Apple Pay (Stripe)' : 'Global Payments (GP webpay)';

const getItemLabel = (count: number) => {
    if (count === 1) return 'položka';
    if (count < 5) return 'položky';
    return 'položek';
};

const isBlank = (value: string) => value.trim().length === 0;

const formatMissingFields = (fields: string[]) => {
    if (fields.length <= 1) {
        return fields[0] || '';
    }

    return `${fields.slice(0, -1).join(', ')} a ${fields[fields.length - 1]}`;
};

const buildMissingFieldsMessage = (fields: string[], nextAction: string) => {
    const formattedFields = formatMissingFields(fields);

    if (fields.length === 1) {
        return `Chybí pole ${formattedFields}. Doplňte ho a potom ${nextAction}.`;
    }

    return `Chybí pole ${formattedFields}. Doplňte je a potom ${nextAction}.`;
};

const checkboxClassName = 'mt-[2px] h-4 w-4 accent-[#b98743]';
const getUsedCouponsStorageKey = (userId: string) => `lumera_used_coupons:${userId}`;

type CheckoutPageProps = {
    variant?: CheckoutVariant;
    shippingMethods?: ShippingMethod[];
    currentUser?: AuthUser | null;
    loyaltySettings?: CheckoutQuoteResponse['loyaltySettings'];
};

export default function CheckoutPage({
    variant = 'minimal',
    shippingMethods = SHIPPING_METHODS,
    currentUser = null,
    loyaltySettings,
}: CheckoutPageProps) {
    const theme = getCheckoutTheme(variant);
    const { cartItems, totalPrice } = useCart();
    const availableShippingMethods = shippingMethods.length ? shippingMethods : SHIPPING_METHODS;
    const [currentStep, setCurrentStep] = useState<Step>('customer');
    const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<PaymentProvider | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [shippingErrorMessage, setShippingErrorMessage] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [formData, setFormData] = useState<CheckoutFormState>({
        email: '',
        phone: '',
        createAccount: false,
        firstName: '',
        lastName: '',
        country: DEFAULT_COUNTRY_CODE,
        address: '',
        city: '',
        zip: '',
        notes: '',
        shippingMethod: '',
        pickupPoint: null,
        billingSameAsShipping: true,
        billingFirstName: '',
        billingLastName: '',
        billingAddress: '',
        billingCity: '',
        billingZip: '',
        isCompany: false,
        companyName: '',
        companyId: '',
        vatId: '',
        paymentProvider: 'stripe',
        termsAccepted: false,
        promoCode: '',
        useBonusBalance: false,
    });
    const [quote, setQuote] = useState<CheckoutQuoteResponse | null>(null);
    const [appliedPromoCode, setAppliedPromoCode] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [couponErrorMessage, setCouponErrorMessage] = useState('');
    const [isQuoteLoading, setIsQuoteLoading] = useState(false);
    const autoAppliedCouponRef = useRef('');
    const applyCouponCodeRef = useRef<
        ((rawCode: string, options?: { silent?: boolean }) => Promise<void>) | null
    >(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        setFormData((prev) => {
            if (!prev.shippingMethod) {
                return prev;
            }

            if (availableShippingMethods.some((method) => method.id === prev.shippingMethod)) {
                return prev;
            }

            return {
                ...prev,
                shippingMethod: '',
                pickupPoint: null,
            };
        });
    }, [availableShippingMethods]);

    useEffect(() => {
        const pickupCarrier = formData.shippingMethod ? getPickupCarrierForMethod(formData.shippingMethod) : undefined;

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
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrorMessage(null);
        setShippingErrorMessage(null);
    };

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        const shippingAddress = currentUser.shippingAddress;
        const billingAddress = currentUser.billingAddress;
        const hasBillingData = hasSavedAddressData(billingAddress);
        const billingMatchesShipping = hasBillingData && areSavedAddressesEquivalent(billingAddress, shippingAddress);

        setFormData((prev) => {
            const hasManualShippingData = Boolean(prev.address || prev.city || prev.zip);
            const hasManualBillingData = Boolean(
                prev.billingFirstName ||
                    prev.billingLastName ||
                    prev.billingAddress ||
                    prev.billingCity ||
                    prev.billingZip ||
                    prev.companyName ||
                    prev.companyId ||
                    prev.vatId,
            );

            return {
                ...prev,
                email: prev.email || currentUser.email,
                phone: prev.phone || shippingAddress?.phone || billingAddress?.phone || '',
                firstName: prev.firstName || shippingAddress?.firstName || currentUser.firstName || '',
                lastName: prev.lastName || shippingAddress?.lastName || currentUser.lastName || '',
                country:
                    hasManualShippingData || !shippingAddress?.country ? prev.country : shippingAddress.country,
                address: prev.address || shippingAddress?.address || '',
                city: prev.city || shippingAddress?.city || '',
                zip: prev.zip || shippingAddress?.zip || '',
                billingSameAsShipping:
                    hasManualBillingData || !hasBillingData ? prev.billingSameAsShipping : billingMatchesShipping,
                billingFirstName:
                    prev.billingFirstName || billingAddress?.firstName || shippingAddress?.firstName || currentUser.firstName || '',
                billingLastName:
                    prev.billingLastName || billingAddress?.lastName || shippingAddress?.lastName || currentUser.lastName || '',
                billingAddress: prev.billingAddress || billingAddress?.address || '',
                billingCity: prev.billingCity || billingAddress?.city || '',
                billingZip: prev.billingZip || billingAddress?.zip || '',
                companyName: prev.companyName || billingAddress?.companyName || '',
                companyId: prev.companyId || billingAddress?.companyId || '',
                vatId: prev.vatId || billingAddress?.vatId || '',
            };
        });
    }, [currentUser]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const pendingCoupon = readPendingCoupon();
        if (!pendingCoupon) {
            return;
        }

        setFormData((prev) => {
            if (prev.promoCode) {
                return prev;
            }

            return {
                ...prev,
                promoCode: pendingCoupon,
            };
        });

        if (!currentUser?.id) {
            setAppliedPromoCode((prev) => prev || pendingCoupon);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        const handleCouponPersisted = (event: Event) => {
            const detail =
                event instanceof CustomEvent && event.detail && typeof event.detail === 'object'
                    ? (event.detail as { couponCode?: unknown })
                    : {};
            const couponCode = sanitizeCouponCode(detail.couponCode);

            if (!couponCode) {
                return;
            }

            setFormData((prev) => ({
                ...prev,
                promoCode: couponCode,
            }));

            if (currentUser?.id) {
                autoAppliedCouponRef.current = couponCode;
                const applyCoupon = applyCouponCodeRef.current;
                if (applyCoupon) {
                    void applyCoupon(couponCode, { silent: true });
                }
            } else {
                setAppliedPromoCode(couponCode);
                setCouponErrorMessage('');
                setCouponMessage('Kupon je nacteny. Sleva se prepocita i bez prihlaseni.');
            }
        };

        window.addEventListener(PENDING_COUPON_EVENT, handleCouponPersisted);
        return () => {
            window.removeEventListener(PENDING_COUPON_EVENT, handleCouponPersisted);
        };
    }, [currentUser?.id]);

    const requestCheckoutQuote = useCallback(async ({
        promoCode = appliedPromoCode,
        useBonusBalance = formData.useBonusBalance,
    }: {
        promoCode?: string;
        useBonusBalance?: boolean;
    } = {}) => {
        const response = await fetch('/api/checkout/quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cartItems,
                shippingMethodId: formData.shippingMethod || undefined,
                promoCode,
                useBonusBalance,
            }),
        });

        const payload = (await response.json().catch(() => null)) as CheckoutQuoteResponse | null;

        if (!response.ok || payload?.error || !payload?.totals) {
            throw new Error(payload?.error || 'Nepodarilo se prepocitat objednavku.');
        }

        setQuote(payload);
        return payload;
    }, [appliedPromoCode, cartItems, formData.shippingMethod, formData.useBonusBalance]);

    const applyCouponCode = useCallback(async (rawCode: string, options?: { silent?: boolean }) => {
        const normalizedCode = sanitizeCouponCode(rawCode);

        if (!normalizedCode) {
            setAppliedPromoCode('');
            setCouponErrorMessage('');
            setCouponMessage('');
            clearPendingCoupon();
            setIsQuoteLoading(true);

            try {
                await requestCheckoutQuote({ promoCode: '', useBonusBalance: formData.useBonusBalance });
            } catch {
                // Keep previous quote if the reset request fails.
            } finally {
                setIsQuoteLoading(false);
            }

            return;
        }

        if (currentUser?.id && typeof window !== 'undefined') {
            try {
                const saved = JSON.parse(
                    localStorage.getItem(getUsedCouponsStorageKey(currentUser.id)) || '[]',
                ) as string[];

                if (saved.includes(normalizedCode)) {
                    setCouponMessage('');
                    setCouponErrorMessage('Tento kupon uz byl na tomto uctu lokalne oznacen jako pouzity.');
                    clearPendingCoupon();
                    return;
                }
            } catch {
                // Ignore invalid local storage state and continue with server validation.
            }
        }

        setCouponMessage('');
        setCouponErrorMessage('');
        setIsQuoteLoading(true);

        try {
            const payload = await requestCheckoutQuote({
                promoCode: normalizedCode,
                useBonusBalance: formData.useBonusBalance,
            });

            setAppliedPromoCode(normalizedCode);
            persistPendingCoupon(normalizedCode);
            if (!options?.silent) {
                setCouponMessage(
                    payload.coupon
                        ? currentUser?.id
                            ? `Kupon ${payload.coupon.code} byl pouzit. Sleva ${formatPrice(payload.coupon.discountAmount)}.`
                            : `Kupon ${payload.coupon.code} je nacteny. Sleva ${formatPrice(payload.coupon.discountAmount)} se zobrazuje uz ted, pred dokonceni objednavky se ale prihlas.`
                        : 'Kupon byl ulozen.',
                );
            }
        } catch (error) {
            setCouponMessage('');
            setCouponErrorMessage(error instanceof Error ? error.message : 'Kupon nelze pouzit.');

            const message = error instanceof Error ? error.message : '';
            if (/not found|not active|already been used/i.test(message)) {
                clearPendingCoupon();
            }
        } finally {
            setIsQuoteLoading(false);
        }
    }, [currentUser?.id, formData.useBonusBalance, requestCheckoutQuote]);

    useEffect(() => {
        applyCouponCodeRef.current = applyCouponCode;
    }, [applyCouponCode]);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setIsQuoteLoading(true);

            try {
                const payload = await requestCheckoutQuote();
                if (!cancelled && payload?.totals) {
                    setQuote(payload);
                }
            } catch {
                // Keep the last successful quote or fallback totals.
            } finally {
                if (!cancelled) {
                    setIsQuoteLoading(false);
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [requestCheckoutQuote]);

    useEffect(() => {
        if (!currentUser?.id) {
            return;
        }

        const pendingCoupon = readPendingCoupon();
        if (!pendingCoupon || appliedPromoCode || autoAppliedCouponRef.current === pendingCoupon) {
            return;
        }

        autoAppliedCouponRef.current = pendingCoupon;
        void applyCouponCode(pendingCoupon, { silent: true });
    }, [appliedPromoCode, applyCouponCode, currentUser?.id]);

    const nextStep = (step: Step, next: Step) => {
        if (!completedSteps.includes(step)) {
            setCompletedSteps((prev) => [...prev, step]);
        }

        setCurrentStep(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToStep = (step: Step) => {
        if (step === 'customer' || completedSteps.includes('customer')) {
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getMissingCustomerFields = () => {
        const missingFields: string[] = [];

        if (isBlank(formData.email)) {
            missingFields.push('E-mailová adresa');
        }

        if (isBlank(formData.phone)) {
            missingFields.push('Telefon pro dopravce');
        }

        if (isBlank(formData.firstName)) {
            missingFields.push('Jméno');
        }

        if (isBlank(formData.lastName)) {
            missingFields.push('Příjmení');
        }

        if (isBlank(formData.address)) {
            missingFields.push('Ulice a číslo popisné');
        }

        if (isBlank(formData.city)) {
            missingFields.push('Město');
        }

        if (isBlank(formData.zip)) {
            missingFields.push('PSČ');
        }

        if (formData.isCompany) {
            if (isBlank(formData.companyName)) {
                missingFields.push('Název firmy');
            }

            if (isBlank(formData.companyId)) {
                missingFields.push('IČ');
            }
        }

        return missingFields;
    };

    const getMissingOrderFields = () => {
        const missingFields: string[] = [];

        if (!formData.shippingMethod) {
            missingFields.push('Způsob dopravy');
            return missingFields;
        }

        const pickupCarrier = getPickupCarrierForMethod(formData.shippingMethod);
        if (pickupCarrier && (!formData.pickupPoint || formData.pickupPoint.carrier !== pickupCarrier)) {
            missingFields.push('Výdejní místo / box');
        }

        return missingFields;
    };

    const validateCustomerStep = (nextAction: string) => {
        const missingFields = getMissingCustomerFields();

        if (missingFields.length === 0) {
            setErrorMessage(null);
            return true;
        }

        setCurrentStep('customer');
        setErrorMessage(buildMissingFieldsMessage(missingFields, nextAction));
        return false;
    };

    const validateOrderStep = (nextAction: string) => {
        const missingFields = getMissingOrderFields();
        const hasShippingIssue = missingFields.some(
            (field) => field === 'Způsob dopravy' || field === 'Výdejní místo / box',
        );

        if (missingFields.length === 0) {
            setErrorMessage(null);
            setShippingErrorMessage(null);
            return true;
        }

        const message = buildMissingFieldsMessage(missingFields, nextAction);
        setCurrentStep('order');
        setErrorMessage(message);
        setShippingErrorMessage(hasShippingIssue ? message : null);
        return false;
    };

    const validateShippingSelection = () => {
        if (!formData.shippingMethod) {
            setShippingErrorMessage('Vyberte prosim zpusob dopravy.');
            return false;
        }

        const shippingMethodId = formData.shippingMethod;
        const pickupCarrier = getPickupCarrierForMethod(shippingMethodId);

        if (pickupCarrier && (!formData.pickupPoint || formData.pickupPoint.carrier !== pickupCarrier)) {
            setShippingErrorMessage('Pro tento způsob dopravy musíte vybrat výdejní místo nebo box.');
            return;
        }

        setShippingErrorMessage(null);
        return true;
    };

    const handleContinueFromShipping = () => {
        if (!validateShippingSelection()) {
            return;
        }

        nextStep('shipping', 'billing');
    };

    const handleApplyCoupon = async () => {
        await applyCouponCode(formData.promoCode);
    };

    const handleFinalSubmit = async () => {
        if (cartItems.length === 0) {
            setErrorMessage('KoĹˇĂ­k je prĂˇzdnĂ˝. PĹ™idejte produkty pĹ™ed platbou.');
            return;
        }

        if (!validateCustomerStep('zkuste objednávku odeslat znovu')) {
            return;
        }

        if (!validateOrderStep('zkuste objednávku odeslat znovu')) {
            return;
        }

        if (!formData.termsAccepted) {
            setErrorMessage('Musíte souhlasit s obchodními podmínkami.');
            return;
        }

        if (appliedPromoCode && !currentUser?.id) {
            setErrorMessage('Pro dokonceni objednavky se slevovym kuponem se prosim prihlas.');
            return;
        }

        if (cartItems.length === 0) {
            setErrorMessage('Košík je prázdný. Přidejte produkty před platbou.');
            return;
        }

        if (!validateShippingSelection()) {
            setErrorMessage('Zkontrolujte prosim sekci dopravy.');
            setCurrentStep('order');
            return;
        }

        const shippingMethodId = formData.shippingMethod as Exclude<typeof formData.shippingMethod, ''>;
        const provider = formData.paymentProvider;
        setErrorMessage(null);

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
                        methodId: shippingMethodId,
                        label: getShippingMethodById(shippingMethodId, availableShippingMethods)?.label,
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
                        notes: formData.notes,
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
                    promoCode: appliedPromoCode,
                    useBonusBalance: formData.useBonusBalance,
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

    const stepsInfo = useMemo(
        () => [
            { id: 'customer' as const, title: 'Kontakt + fakturace', icon: User },
            { id: 'order' as const, title: 'Doprava + platba', icon: Truck },
        ],
        [],
    );

    if (!isClient) return null;

    const currentStepIndex = stepsInfo.findIndex((step) => step.id === currentStep);
    const progress = ((currentStepIndex + 1) / stepsInfo.length) * 100;
    const selectedShippingMethod =
        formData.shippingMethod ? getShippingMethodById(formData.shippingMethod, availableShippingMethods) : undefined;
    const shippingPrice = quote?.totals?.shipping ?? selectedShippingMethod?.price ?? 0;
    const subtotalPrice = quote?.totals?.subtotal ?? totalPrice;
    const couponDiscountAmount = quote?.discounts?.couponDiscountAmount ?? 0;
    const firstPurchaseDiscountAmount = quote?.discounts?.firstPurchaseDiscountAmount ?? 0;
    const bonusDiscountAmount = quote?.discounts?.bonusDiscountAmount ?? 0;
    const discountedSubtotal = quote?.discounts?.discountedSubtotal ?? subtotalPrice;
    const orderTotal = quote?.totals?.total ?? discountedSubtotal + shippingPrice;
    const vatAmount = Number((orderTotal * 0.21).toFixed(2));
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const effectiveLoyaltySettings = quote?.loyaltySettings || loyaltySettings;
    const isCustomerStep = currentStep === 'customer';
    const description =
        variant === 'minimal'
            ? 'Čistší a klidnější pokladna v jednodušším rozvržení, ale stále ve stylu Lumera.'
            : 'Vše důležité v jednom přehledu. Kontakt, doprava, fakturace i platba bez těžkopádného layoutu.';

    const renderContactSection = () => (
        <CheckoutSectionCard
            variant={variant}
            stepNumber={1}
            eyebrow="Krok 1"
            title="Můj kontakt"
            active={currentStep === 'contact'}
            completed={completedSteps.includes('contact')}
            onOpen={() => goToStep('contact')}
            summary={completedSteps.includes('contact') ? `${formData.email} · ${formData.phone}` : undefined}
        >
            <div className={theme.field}>
                <label className={theme.label}>E-mailová adresa *</label>
                <input
                    type="email"
                    className={theme.input}
                    placeholder="vase@adresa.cz"
                    value={formData.email}
                    onChange={(event) => updateFormData('email', event.target.value)}
                />
                <p className={theme.help}>Na tento e-mail pošleme potvrzení objednávky i další průběh.</p>
            </div>

            <div className={theme.field}>
                <label className={theme.label}>Telefon pro dopravce *</label>
                <input
                    type="tel"
                    className={theme.input}
                    placeholder="+420 123 456 789"
                    value={formData.phone}
                    onChange={(event) => updateFormData('phone', event.target.value)}
                />
            </div>

            <label className={theme.check}>
                <input
                    type="checkbox"
                    className={checkboxClassName}
                    checked={formData.createAccount}
                    onChange={(event) => updateFormData('createAccount', event.target.checked)}
                />
                <span>Vytvořit účet po dokončení objednávky</span>
            </label>

            <button
                type="button"
                className={theme.primary}
                onClick={() => nextStep('contact', 'shipping')}
                disabled={!formData.email || !formData.phone}
            >
                Pokračovat k dopravě
            </button>
        </CheckoutSectionCard>
    );

    const renderShippingSection = () => (
        <CheckoutSectionCard
            variant={variant}
            stepNumber={2}
            eyebrow="Krok 2"
            title="Doprava a doručení"
            active={currentStep === 'shipping'}
            completed={completedSteps.includes('shipping')}
            onOpen={() => goToStep('shipping')}
            summary={
                completedSteps.includes('shipping') ? (
                    <>
                        <div>
                            {formData.firstName} {formData.lastName}, {formData.address}, {formData.city} {formData.zip}
                        </div>
                        {selectedShippingMethod ? (
                            <div className="mt-1 text-[#7a7164]">{selectedShippingMethod.label}</div>
                        ) : null}
                        {formData.pickupPoint && (
                            <div className="mt-1 text-[12px] text-[#6b6257]">
                                {formData.pickupPoint.name}
                                {formatPickupPointAddress(formData.pickupPoint)
                                    ? ` · ${formatPickupPointAddress(formData.pickupPoint)}`
                                    : ''}
                            </div>
                        )}
                    </>
                ) : undefined
            }
        >
            <div className={theme.inputGrid}>
                <div className={theme.field}>
                    <label className={theme.label}>Jméno *</label>
                    <input
                        type="text"
                        className={theme.input}
                        value={formData.firstName}
                        onChange={(event) => updateFormData('firstName', event.target.value)}
                    />
                </div>
                <div className={theme.field}>
                    <label className={theme.label}>Příjmení *</label>
                    <input
                        type="text"
                        className={theme.input}
                        value={formData.lastName}
                        onChange={(event) => updateFormData('lastName', event.target.value)}
                    />
                </div>
            </div>

            <div className={theme.inputGrid}>
                <div className={theme.field}>
                    <label className={theme.label}>Země *</label>
                    <select
                        className={theme.input}
                        value={formData.country}
                        disabled
                        aria-disabled="true"
                    >
                        <option value="CZ">Česká republika</option>
                    </select>
                </div>
                <div className={theme.field}>
                    <label className={theme.label}>PSČ *</label>
                    <input
                        type="text"
                        className={theme.input}
                        value={formData.zip}
                        onChange={(event) => updateFormData('zip', event.target.value)}
                    />
                </div>
            </div>

            <div className={theme.field}>
                <label className={theme.label}>Ulice a číslo popisné *</label>
                <input
                    type="text"
                    className={theme.input}
                    value={formData.address}
                    onChange={(event) => updateFormData('address', event.target.value)}
                />
            </div>

            <div className={theme.field}>
                <label className={theme.label}>Město *</label>
                <input
                    type="text"
                    className={theme.input}
                    value={formData.city}
                    onChange={(event) => updateFormData('city', event.target.value)}
                />
            </div>

            <div className={theme.field}>
                <label className={theme.label}>Poznámka k objednávce</label>
                <textarea
                    className={theme.textarea}
                    placeholder="Upřesnění k doručení, jméno na zvonku a podobně."
                    value={formData.notes}
                    onChange={(event) => updateFormData('notes', event.target.value)}
                />
            </div>

            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Výběr dopravy</p>
                    <h3 className={theme.stageTitle}>Způsob doručení</h3>
                </div>

                {availableShippingMethods.map((method) => {
                    const isSelected = formData.shippingMethod === method.id;
                    const showPickupSelector = isSelected && Boolean(method.pickupCarrier);

                    return (
                        <div
                            key={method.id}
                            className={cn(
                                'overflow-hidden rounded-[12px] border transition',
                                isSelected ? theme.optionSelected : theme.optionIdle,
                            )}
                        >
                        <button
                            type="button"
                            className="flex w-full items-start gap-3 p-3.5 text-left"
                            onClick={() => {
                                setShippingErrorMessage(null);
                                updateFormData('shippingMethod', method.id);
                            }}
                        >
                            <span className={theme.optionControl}>
                                {isSelected && <span className="h-2 w-2 rounded-full bg-[#b98743]" />}
                            </span>
                            <span className={theme.optionCopy}>
                                <span className={theme.optionTitle}>{method.label}</span>
                                <span className={theme.optionMeta}>{method.description}</span>
                            </span>
                            <span className={theme.optionPrice}>
                                {method.price === 0 ? 'Zdarma' : formatPrice(method.price)}
                            </span>
                        </button>
                        {showPickupSelector && (
                            <div className="border-t border-black/8 px-3.5 pb-3.5 pt-3">
                                <PickupPointSelector
                                    variant={variant}
                                    displayMode="inline"
                                    shippingMethodId={method.id}
                                    country={formData.country}
                                    selectedPoint={formData.pickupPoint}
                                    onSelect={(pickupPoint) => {
                                        setShippingErrorMessage(null);
                                        updateFormData('pickupPoint', pickupPoint);
                                    }}
                                />
                            </div>
                        )}
                        </div>
                    );
                })}
            </div>

            {shippingErrorMessage && <p className="text-[12px] leading-5 text-[#b42318]">{shippingErrorMessage}</p>}

            <button
                type="button"
                className={theme.primary}
                onClick={handleContinueFromShipping}
                disabled={
                    !formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.zip
                }
            >
                Pokračovat k fakturaci
            </button>
        </CheckoutSectionCard>
    );

    const renderBillingSection = () => (
        <CheckoutSectionCard
            variant={variant}
            stepNumber={3}
            eyebrow="Krok 3"
            title="Fakturační údaje"
            active={currentStep === 'billing'}
            completed={completedSteps.includes('billing')}
            onOpen={() => goToStep('billing')}
            summary={
                completedSteps.includes('billing') ? (
                    <>
                        <div>
                            {formData.billingSameAsShipping
                                ? 'Stejná jako doručovací adresa'
                                : `${formData.billingFirstName} ${formData.billingLastName}, ${formData.billingAddress}, ${formData.billingCity} ${formData.billingZip}`}
                        </div>
                        {formData.isCompany && (
                            <div className="mt-1 text-[#7a7164]">
                                {formData.companyName}
                                {formData.companyId ? ` · IČ ${formData.companyId}` : ''}
                            </div>
                        )}
                    </>
                ) : undefined
            }
        >
            <div className={theme.toggleGrid}>
                <label className={cn(theme.check, theme.checkCard)}>
                    <input
                        type="checkbox"
                        className={checkboxClassName}
                        checked={formData.billingSameAsShipping}
                        onChange={(event) => updateFormData('billingSameAsShipping', event.target.checked)}
                    />
                    <span>Fakturační adresa stejná jako doručovací</span>
                </label>

                <label className={cn(theme.check, theme.checkCard)}>
                    <input
                        type="checkbox"
                        className={checkboxClassName}
                        checked={formData.isCompany}
                        onChange={(event) => updateFormData('isCompany', event.target.checked)}
                    />
                    <span>Nakupuji na firmu</span>
                </label>
            </div>

            {formData.isCompany && (
                <div className={theme.surface}>
                    <div>
                        <p className={theme.eyebrow}>Firma</p>
                        <h3 className={theme.stageTitle}>Firemní identifikace</h3>
                    </div>

                    <div className={theme.field}>
                        <label className={theme.label}>Název firmy *</label>
                        <input
                            type="text"
                            className={theme.input}
                            value={formData.companyName}
                            onChange={(event) => updateFormData('companyName', event.target.value)}
                        />
                    </div>

                    <div className={theme.inputGrid}>
                        <div className={theme.field}>
                            <label className={theme.label}>IČ *</label>
                            <input
                                type="text"
                                className={theme.input}
                                value={formData.companyId}
                                onChange={(event) => updateFormData('companyId', event.target.value)}
                            />
                        </div>
                        <div className={theme.field}>
                            <label className={theme.label}>DIČ</label>
                            <input
                                type="text"
                                className={theme.input}
                                value={formData.vatId}
                                onChange={(event) => updateFormData('vatId', event.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {!formData.billingSameAsShipping && (
                <div className={theme.surface}>
                    <div>
                        <p className={theme.eyebrow}>Fakturace</p>
                        <h3 className={theme.stageTitle}>Samostatná fakturační adresa</h3>
                    </div>

                    <div className={theme.inputGrid}>
                        <div className={theme.field}>
                            <label className={theme.label}>Jméno *</label>
                            <input
                                type="text"
                                className={theme.input}
                                value={formData.billingFirstName}
                                onChange={(event) => updateFormData('billingFirstName', event.target.value)}
                            />
                        </div>
                        <div className={theme.field}>
                            <label className={theme.label}>Příjmení *</label>
                            <input
                                type="text"
                                className={theme.input}
                                value={formData.billingLastName}
                                onChange={(event) => updateFormData('billingLastName', event.target.value)}
                            />
                        </div>
                    </div>

                    <div className={theme.field}>
                        <label className={theme.label}>Ulice a číslo *</label>
                        <input
                            type="text"
                            className={theme.input}
                            value={formData.billingAddress}
                            onChange={(event) => updateFormData('billingAddress', event.target.value)}
                        />
                    </div>

                    <div className={theme.inputGrid}>
                        <div className={theme.field}>
                            <label className={theme.label}>Město *</label>
                            <input
                                type="text"
                                className={theme.input}
                                value={formData.billingCity}
                                onChange={(event) => updateFormData('billingCity', event.target.value)}
                            />
                        </div>
                        <div className={theme.field}>
                            <label className={theme.label}>PSČ *</label>
                            <input
                                type="text"
                                className={theme.input}
                                value={formData.billingZip}
                                onChange={(event) => updateFormData('billingZip', event.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <button type="button" className={theme.primary} onClick={() => nextStep('billing', 'payment')}>
                Pokračovat k platbě
            </button>
        </CheckoutSectionCard>
    );

    const renderPaymentSection = () => (
        <CheckoutSectionCard
            variant={variant}
            stepNumber={4}
            eyebrow="Krok 4"
            title="Platba a potvrzení"
            active={currentStep === 'payment'}
            completed={completedSteps.includes('payment')}
            onOpen={() => goToStep('payment')}
            summary="Platební bránu a finální potvrzení vyberete v posledním kroku."
        >
            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Sleva</p>
                    <h3 className={theme.stageTitle}>Dárkový nebo slevový kód</h3>
                </div>

                <div className={theme.inlineGrid}>
                    <input
                        type="text"
                        className={theme.input}
                        placeholder="Kód kupónu"
                        value={formData.promoCode}
                        onChange={(event) => updateFormData('promoCode', event.target.value)}
                    />
                    <button type="button" className={theme.secondary}>
                        Použít
                    </button>
                </div>
            </div>

            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Platba</p>
                    <h3 className={theme.stageTitle}>Vyberte platební bránu</h3>
                </div>

                {([
                    {
                        value: 'stripe',
                        title: 'Online karta / Apple Pay (Stripe)',
                        copy: 'Rychlé dokončení objednávky s okamžitým potvrzením.',
                    },
                    {
                        value: 'global-payments',
                        title: 'Global Payments (GP webpay)',
                        copy: 'Tradiční platební brána pro karty i lokální metody.',
                    },
                ] as const).map((option) => {
                    const isSelected = formData.paymentProvider === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={cn(theme.option, isSelected ? theme.optionSelected : theme.optionIdle)}
                            onClick={() => updateFormData('paymentProvider', option.value)}
                        >
                            <span className={theme.optionControl}>
                                {isSelected && <span className="h-2 w-2 rounded-full bg-[#b98743]" />}
                            </span>
                            <span className={theme.optionCopy}>
                                <span className={theme.optionTitle}>{option.title}</span>
                                <span className={theme.optionMeta}>{option.copy}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <label className={theme.check}>
                <input
                    type="checkbox"
                    className={checkboxClassName}
                    checked={formData.termsAccepted}
                    onChange={(event) => updateFormData('termsAccepted', event.target.checked)}
                />
                <span>
                    Souhlasím s{' '}
                    <a href="/obchodni-podminky" className="underline decoration-[#b98743]/60 underline-offset-4">
                        obchodními podmínkami
                    </a>{' '}
                    a{' '}
                    <a href="/ochrana-osobnich-udaju" className="underline decoration-[#b98743]/60 underline-offset-4">
                        ochranou osobních údajů
                    </a>{' '}
                    *
                </span>
            </label>

            {errorMessage && (
                <p className="rounded-[12px] border border-[#b42318]/15 bg-[#fff4f2] px-3 py-2.5 text-[12px] leading-5 text-[#b42318]">
                    {errorMessage}
                </p>
            )}

            <button
                type="button"
                className={theme.primary}
                onClick={handleFinalSubmit}
                disabled={isSubmitting !== null}
            >
                {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Přesměrování...
                    </span>
                ) : (
                    `Objednat a zaplatit ${formatPrice(orderTotal)}`
                )}
            </button>
        </CheckoutSectionCard>
    );

    const renderEnhancedPaymentSection = () => (
        <CheckoutSectionCard
            variant={variant}
            stepNumber={4}
            eyebrow="Krok 4"
            title="Platba a potvrzeni"
            active={currentStep === 'payment'}
            completed={completedSteps.includes('payment')}
            onOpen={() => goToStep('payment')}
            summary="Platebni branu a finalni potvrzeni vyberete v poslednim kroku."
        >
            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Sleva</p>
                    <h3 className={theme.stageTitle}>Darkovy nebo slevovy kod</h3>
                </div>

                <div className={theme.inlineGrid}>
                    <input
                        type="text"
                        className={theme.input}
                        placeholder="Kod kuponu"
                        value={formData.promoCode}
                        onChange={(event) => updateFormData('promoCode', event.target.value)}
                    />
                    <button
                        type="button"
                        className={theme.secondary}
                        onClick={handleApplyCoupon}
                        disabled={isQuoteLoading}
                    >
                        {isQuoteLoading ? 'Pockam...' : 'Pouzit'}
                    </button>
                </div>

                {appliedPromoCode ? (
                    <p className="text-[13px] text-[#6b6257]">
                        Aktivni kod: <span className="font-semibold text-[#111111]">{appliedPromoCode}</span>
                    </p>
                ) : null}

                {couponMessage ? (
                    <p className="rounded-[12px] border border-[#1f6f43]/15 bg-[#f4fbf6] px-3 py-2.5 text-[12px] leading-5 text-[#1f6f43]">
                        {couponMessage}
                    </p>
                ) : null}

                {couponErrorMessage ? (
                    <p className="rounded-[12px] border border-[#b42318]/15 bg-[#fff4f2] px-3 py-2.5 text-[12px] leading-5 text-[#b42318]">
                        {couponErrorMessage}
                    </p>
                ) : null}
            </div>

            {currentUser && effectiveLoyaltySettings?.bonusesEnabled ? (
                <div className={theme.surface}>
                    <div>
                        <p className={theme.eyebrow}>Bonusy</p>
                        <h3 className={theme.stageTitle}>Vyuziti bonusnich jednotek</h3>
                    </div>

                    <div className="rounded-[16px] border border-[#111111]/8 bg-[#fffaf3] px-4 py-4 text-[14px] leading-[1.7] text-[#3f382f]">
                        <p>
                            Na uctu mas{' '}
                            <span className="font-semibold text-[#111111]">
                                {quote?.loyalty?.bonusBalance ?? currentUser.bonusBalance ?? 0}
                            </span>{' '}
                            bonusnich jednotek.
                        </p>
                        <p className="mt-1 text-[12px] text-[#6b6257]">
                            {effectiveLoyaltySettings.redemptionBonusUnits} bonusu ={' '}
                            {formatPrice(effectiveLoyaltySettings.redemptionAmount)} slevy. Za kazdych{' '}
                            {formatPrice(effectiveLoyaltySettings.earningSpendAmount)} v produktech ziskas{' '}
                            {effectiveLoyaltySettings.earningBonusUnits} bonusu.
                        </p>
                    </div>

                    <label className={theme.check}>
                        <input
                            type="checkbox"
                            className={checkboxClassName}
                            checked={formData.useBonusBalance}
                            onChange={(event) => updateFormData('useBonusBalance', event.target.checked)}
                        />
                        <span>Pouzit bonusni jednotky na tuto objednavku</span>
                    </label>

                    {formData.useBonusBalance ? (
                        <p className="text-[13px] leading-5 text-[#6b6257]">
                            Pri teto objednavce se pouzije {quote?.loyalty?.bonusUnitsSpent ?? 0} bonusu a odecte se{' '}
                            {formatPrice(quote?.discounts?.bonusDiscountAmount ?? 0)}.
                        </p>
                    ) : null}

                    <p className="text-[13px] leading-5 text-[#6b6257]">
                        Po uspesne platbe se pripise {quote?.loyalty?.bonusUnitsEarned ?? 0} bonusnich jednotek.
                    </p>
                </div>
            ) : null}

            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Platba</p>
                    <h3 className={theme.stageTitle}>Vyberte platebni branu</h3>
                </div>

                {([
                    {
                        value: 'stripe',
                        title: 'Online karta / Apple Pay (Stripe)',
                        copy: 'Rychle dokonceni objednavky s okamzitym potvrzenim.',
                    },
                    {
                        value: 'global-payments',
                        title: 'Global Payments (GP webpay)',
                        copy: 'Tradicni platebni brana pro karty i lokalni metody.',
                    },
                ] as const).map((option) => {
                    const isSelected = formData.paymentProvider === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={cn(theme.option, isSelected ? theme.optionSelected : theme.optionIdle)}
                            onClick={() => updateFormData('paymentProvider', option.value)}
                        >
                            <span className={theme.optionControl}>
                                {isSelected && <span className="h-2 w-2 rounded-full bg-[#b98743]" />}
                            </span>
                            <span className={theme.optionCopy}>
                                <span className={theme.optionTitle}>{option.title}</span>
                                <span className={theme.optionMeta}>{option.copy}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <label className={theme.check}>
                <input
                    type="checkbox"
                    className={checkboxClassName}
                    checked={formData.termsAccepted}
                    onChange={(event) => updateFormData('termsAccepted', event.target.checked)}
                />
                <span>
                    Souhlasim s{' '}
                    <a href="/obchodni-podminky" className="underline decoration-[#b98743]/60 underline-offset-4">
                        obchodnimi podminkami
                    </a>{' '}
                    a{' '}
                    <a href="/ochrana-osobnich-udaju" className="underline decoration-[#b98743]/60 underline-offset-4">
                        ochranou osobnich udaju
                    </a>{' '}
                    *
                </span>
            </label>

            {errorMessage && (
                <p className="rounded-[12px] border border-[#b42318]/15 bg-[#fff4f2] px-3 py-2.5 text-[12px] leading-5 text-[#b42318]">
                    {errorMessage}
                </p>
            )}

            <button
                type="button"
                className={theme.primary}
                onClick={handleFinalSubmit}
                disabled={isSubmitting !== null}
            >
                {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Presmerovani...
                    </span>
                ) : (
                    `Objednat a zaplatit ${formatPrice(orderTotal)}`
                )}
            </button>
        </CheckoutSectionCard>
    );

    const billingSummaryText = formData.billingSameAsShipping
        ? 'Fakturacni adresa se prevezme z doruceni.'
        : formData.billingFirstName || formData.billingLastName || formData.billingAddress || formData.billingCity || formData.billingZip
          ? `${formData.billingFirstName} ${formData.billingLastName}, ${formData.billingAddress}, ${formData.billingCity} ${formData.billingZip}`
          : 'Fakturacni udaje doplnite v prvnim kroku.';

    const customerSummary = (
        <>
            <div>
                {formData.email || 'E-mail zatim chybi'}
                {formData.phone ? ` · ${formData.phone}` : ''}
            </div>
            <div className="mt-1 text-[#7a7164]">{billingSummaryText}</div>
            {formData.isCompany && formData.companyName ? (
                <div className="mt-1 text-[#6b6257]">
                    {formData.companyName}
                    {formData.companyId ? ` · IC ${formData.companyId}` : ''}
                </div>
            ) : null}
        </>
    );

    const orderSummary = (
        <>
            <div>{selectedShippingMethod?.label || 'Dopravu vyberete v druhem kroku.'}</div>
            <div className="mt-1 text-[#7a7164]">{getPaymentLabel(formData.paymentProvider)}</div>
            {formData.pickupPoint ? (
                <div className="mt-1 text-[12px] text-[#6b6257]">
                    {formData.pickupPoint.name}
                    {formatPickupPointAddress(formData.pickupPoint)
                        ? ` · ${formatPickupPointAddress(formData.pickupPoint)}`
                        : ''}
                </div>
            ) : null}
        </>
    );

    const renderCustomerBillingSection = () => (
        <CheckoutSectionCard
            variant={variant}
            stepNumber={1}
            eyebrow="Krok 1"
            title="Kontakt a fakturace"
            active={currentStep === 'customer'}
            completed={completedSteps.includes('customer')}
            onOpen={() => goToStep('customer')}
            summary={customerSummary}
        >
            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Kontakt</p>
                    <h3 className={theme.stageTitle}>Muj kontakt</h3>
                </div>

                <div className={theme.field}>
                    <label className={theme.label}>E-mailova adresa *</label>
                    <input
                        type="email"
                        className={theme.input}
                        placeholder="vase@adresa.cz"
                        value={formData.email}
                        onChange={(event) => updateFormData('email', event.target.value)}
                    />
                    <p className={theme.help}>Na tento e-mail posleme potvrzeni objednavky i dalsi informace.</p>
                </div>

                <div className={theme.field}>
                    <label className={theme.label}>Telefon pro dopravce *</label>
                    <input
                        type="tel"
                        className={theme.input}
                        placeholder="+420 123 456 789"
                        value={formData.phone}
                        onChange={(event) => updateFormData('phone', event.target.value)}
                    />
                </div>

                <label className={theme.check}>
                    <input
                        type="checkbox"
                        className={checkboxClassName}
                        checked={formData.createAccount}
                        onChange={(event) => updateFormData('createAccount', event.target.checked)}
                    />
                    <span>Vytvorit ucet po dokonceni objednavky</span>
                </label>
            </div>

            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Doruceni</p>
                    <h3 className={theme.stageTitle}>Kontakt pro doruceni a adresa</h3>
                </div>

                <div className={theme.inputGrid}>
                    <div className={theme.field}>
                        <label className={theme.label}>Jmeno *</label>
                        <input
                            type="text"
                            className={theme.input}
                            value={formData.firstName}
                            onChange={(event) => updateFormData('firstName', event.target.value)}
                        />
                    </div>
                    <div className={theme.field}>
                        <label className={theme.label}>Prijmeni *</label>
                        <input
                            type="text"
                            className={theme.input}
                            value={formData.lastName}
                            onChange={(event) => updateFormData('lastName', event.target.value)}
                        />
                    </div>
                </div>

                <div className={theme.inputGrid}>
                    <div className={theme.field}>
                        <label className={theme.label}>Zeme *</label>
                        <select className={theme.input} value={formData.country} disabled aria-disabled="true">
                            <option value="CZ">Ceska republika</option>
                        </select>
                    </div>
                    <div className={theme.field}>
                        <label className={theme.label}>PSC *</label>
                        <input
                            type="text"
                            className={theme.input}
                            value={formData.zip}
                            onChange={(event) => updateFormData('zip', event.target.value)}
                        />
                    </div>
                </div>

                <div className={theme.field}>
                    <label className={theme.label}>Ulice a cislo popisne *</label>
                    <input
                        type="text"
                        className={theme.input}
                        value={formData.address}
                        onChange={(event) => updateFormData('address', event.target.value)}
                    />
                </div>

                <div className={theme.field}>
                    <label className={theme.label}>Mesto *</label>
                    <input
                        type="text"
                        className={theme.input}
                        value={formData.city}
                        onChange={(event) => updateFormData('city', event.target.value)}
                    />
                </div>

                <div className={theme.field}>
                    <label className={theme.label}>Poznamka k objednavce</label>
                    <textarea
                        className={theme.textarea}
                        placeholder="Upresneni k doruceni, jmeno na zvonku a podobne."
                        value={formData.notes}
                        onChange={(event) => updateFormData('notes', event.target.value)}
                    />
                </div>
            </div>

            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Fakturace</p>
                    <h3 className={theme.stageTitle}>Fakturacni udaje</h3>
                </div>

                <div className={theme.toggleGrid}>
                    <label className={cn(theme.check, theme.checkCard)}>
                        <input
                            type="checkbox"
                            className={checkboxClassName}
                            checked={formData.isCompany}
                            onChange={(event) => updateFormData('isCompany', event.target.checked)}
                        />
                        <span>Nakupuji na firmu</span>
                    </label>
                </div>

                {formData.isCompany ? (
                    <div className="mt-6 flex flex-col gap-5 border-t border-black/8 pt-6">
                        <div className={theme.field}>
                            <label className={theme.label}>Nazev firmy *</label>
                            <input
                                type="text"
                                className={theme.input}
                                value={formData.companyName}
                                onChange={(event) => updateFormData('companyName', event.target.value)}
                            />
                        </div>

                        <div className={theme.inputGrid}>
                            <div className={theme.field}>
                                <label className={theme.label}>IC *</label>
                                <input
                                    type="text"
                                    className={theme.input}
                                    value={formData.companyId}
                                    onChange={(event) => updateFormData('companyId', event.target.value)}
                                />
                            </div>
                            <div className={theme.field}>
                                <label className={theme.label}>DIC</label>
                                <input
                                    type="text"
                                    className={theme.input}
                                    value={formData.vatId}
                                    onChange={(event) => updateFormData('vatId', event.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {errorMessage ? (
                <p className="rounded-[12px] border border-[#b42318]/15 bg-[#fff4f2] px-3 py-2.5 text-[12px] leading-5 text-[#b42318]">
                    {errorMessage}
                </p>
            ) : null}

            <button
                type="button"
                className={theme.primary}
                onClick={() => {
                    if (!validateCustomerStep('pokračujte k dopravě a platbě')) {
                        return;
                    }

                    nextStep('customer', 'order');
                }}
            >
                Pokracovat k doprave a platbe
            </button>
        </CheckoutSectionCard>
    );

    const renderShippingPaymentSection = () => (
        <CheckoutSectionCard
            variant={variant}
            stepNumber={2}
            eyebrow="Krok 2"
            title="Doprava a platba"
            active={currentStep === 'order'}
            completed={completedSteps.includes('order')}
            onOpen={() => goToStep('order')}
            summary={orderSummary}
        >
            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Doprava</p>
                    <h3 className={theme.stageTitle}>Zpusob doruceni</h3>
                </div>

                {availableShippingMethods.map((method) => {
                    const isSelected = formData.shippingMethod === method.id;
                    const showPickupSelector = isSelected && Boolean(method.pickupCarrier);

                    return (
                        <div
                            key={method.id}
                            className={cn(
                                'overflow-hidden rounded-[12px] border transition',
                                isSelected ? theme.optionSelected : theme.optionIdle,
                            )}
                        >
                            <button
                                type="button"
                                className="flex w-full items-start gap-3 p-3.5 text-left"
                                onClick={() => {
                                    setShippingErrorMessage(null);
                                    updateFormData('shippingMethod', method.id);
                                }}
                            >
                                <span className={theme.optionControl}>
                                    {isSelected ? <span className="h-2 w-2 rounded-full bg-[#b98743]" /> : null}
                                </span>
                                <span className={theme.optionCopy}>
                                    <span className={theme.optionTitle}>{method.label}</span>
                                    <span className={theme.optionMeta}>{method.description}</span>
                                </span>
                                <span className={theme.optionPrice}>
                                    {method.price === 0 ? 'Zdarma' : formatPrice(method.price)}
                                </span>
                            </button>

                            {showPickupSelector ? (
                                <div className="border-t border-black/8 px-3.5 pb-3.5 pt-3">
                                    <PickupPointSelector
                                        variant={variant}
                                        displayMode="inline"
                                        shippingMethodId={method.id}
                                        country={formData.country}
                                        selectedPoint={formData.pickupPoint}
                                        onSelect={(pickupPoint) => {
                                            setShippingErrorMessage(null);
                                            updateFormData('pickupPoint', pickupPoint);
                                        }}
                                    />
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>

            {shippingErrorMessage ? (
                <p className="text-[12px] leading-5 text-[#b42318]">{shippingErrorMessage}</p>
            ) : null}

            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Sleva</p>
                    <h3 className={theme.stageTitle}>Darkovy nebo slevovy kod</h3>
                </div>

                <div className={theme.inlineGrid}>
                    <input
                        type="text"
                        className={theme.input}
                        placeholder="Kod kuponu"
                        value={formData.promoCode}
                        onChange={(event) => updateFormData('promoCode', event.target.value)}
                    />
                    <button
                        type="button"
                        className={theme.secondary}
                        onClick={handleApplyCoupon}
                        disabled={isQuoteLoading}
                    >
                        {isQuoteLoading ? 'Pockam...' : 'Pouzit'}
                    </button>
                </div>

                {appliedPromoCode ? (
                    <p className="text-[13px] text-[#6b6257]">
                        Aktivni kod: <span className="font-semibold text-[#111111]">{appliedPromoCode}</span>
                    </p>
                ) : null}

                {couponMessage ? (
                    <p className="rounded-[12px] border border-[#1f6f43]/15 bg-[#f4fbf6] px-3 py-2.5 text-[12px] leading-5 text-[#1f6f43]">
                        {couponMessage}
                    </p>
                ) : null}

                {couponErrorMessage ? (
                    <p className="rounded-[12px] border border-[#b42318]/15 bg-[#fff4f2] px-3 py-2.5 text-[12px] leading-5 text-[#b42318]">
                        {couponErrorMessage}
                    </p>
                ) : null}
            </div>

            {currentUser && effectiveLoyaltySettings?.bonusesEnabled ? (
                <div className={theme.surface}>
                    <div>
                        <p className={theme.eyebrow}>Bonusy</p>
                        <h3 className={theme.stageTitle}>Vyuziti bonusnich jednotek</h3>
                    </div>

                    <div className="rounded-[16px] border border-[#111111]/8 bg-[#fffaf3] px-4 py-4 text-[14px] leading-[1.7] text-[#3f382f]">
                        <p>
                            Na uctu mas{' '}
                            <span className="font-semibold text-[#111111]">
                                {quote?.loyalty?.bonusBalance ?? currentUser.bonusBalance ?? 0}
                            </span>{' '}
                            bonusnich jednotek.
                        </p>
                        <p className="mt-1 text-[12px] text-[#6b6257]">
                            {effectiveLoyaltySettings.redemptionBonusUnits} bonusu ={' '}
                            {formatPrice(effectiveLoyaltySettings.redemptionAmount)} slevy. Za kazdych{' '}
                            {formatPrice(effectiveLoyaltySettings.earningSpendAmount)} v produktech ziskas{' '}
                            {effectiveLoyaltySettings.earningBonusUnits} bonusu.
                        </p>
                    </div>

                    <label className={theme.check}>
                        <input
                            type="checkbox"
                            className={checkboxClassName}
                            checked={formData.useBonusBalance}
                            onChange={(event) => updateFormData('useBonusBalance', event.target.checked)}
                        />
                        <span>Pouzit bonusni jednotky na tuto objednavku</span>
                    </label>

                    {formData.useBonusBalance ? (
                        <p className="text-[13px] leading-5 text-[#6b6257]">
                            Pri teto objednavce se pouzije {quote?.loyalty?.bonusUnitsSpent ?? 0} bonusu a odecte se{' '}
                            {formatPrice(quote?.discounts?.bonusDiscountAmount ?? 0)}.
                        </p>
                    ) : null}

                    <p className="text-[13px] leading-5 text-[#6b6257]">
                        Po uspesne platbe se pripise {quote?.loyalty?.bonusUnitsEarned ?? 0} bonusnich jednotek.
                    </p>
                </div>
            ) : null}

            <div className={theme.surface}>
                <div>
                    <p className={theme.eyebrow}>Platba</p>
                    <h3 className={theme.stageTitle}>Vyberte platebni branu</h3>
                </div>

                {([
                    {
                        value: 'stripe',
                        title: 'Online karta / Apple Pay (Stripe)',
                        copy: 'Rychle dokonceni objednavky s okamzitym potvrzenim.',
                    },
                    {
                        value: 'global-payments',
                        title: 'Global Payments (GP webpay)',
                        copy: 'Tradicni platebni brana pro karty i lokalni metody.',
                    },
                ] as const).map((option) => {
                    const isSelected = formData.paymentProvider === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={cn(theme.option, isSelected ? theme.optionSelected : theme.optionIdle)}
                            onClick={() => updateFormData('paymentProvider', option.value)}
                        >
                            <span className={theme.optionControl}>
                                {isSelected ? <span className="h-2 w-2 rounded-full bg-[#b98743]" /> : null}
                            </span>
                            <span className={theme.optionCopy}>
                                <span className={theme.optionTitle}>{option.title}</span>
                                <span className={theme.optionMeta}>{option.copy}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <label className={theme.check}>
                <input
                    type="checkbox"
                    className={checkboxClassName}
                    checked={formData.termsAccepted}
                    onChange={(event) => updateFormData('termsAccepted', event.target.checked)}
                />
                <span>
                    Souhlasim s{' '}
                    <a href="/obchodni-podminky" className="underline decoration-[#b98743]/60 underline-offset-4">
                        obchodnimi podminkami
                    </a>{' '}
                    a{' '}
                    <a href="/ochrana-osobnich-udaju" className="underline decoration-[#b98743]/60 underline-offset-4">
                        ochranou osobnich udaju
                    </a>{' '}
                    *
                </span>
            </label>

            {errorMessage ? (
                <p className="rounded-[12px] border border-[#b42318]/15 bg-[#fff4f2] px-3 py-2.5 text-[12px] leading-5 text-[#b42318]">
                    {errorMessage}
                </p>
            ) : null}

            <button
                type="button"
                className={theme.primary}
                onClick={handleFinalSubmit}
                disabled={isSubmitting !== null}
            >
                {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Presmerovani...
                    </span>
                ) : (
                    `Objednat a zaplatit ${formatPrice(orderTotal)}`
                )}
            </button>
        </CheckoutSectionCard>
    );

    const legacyStepRenderers = [
        renderContactSection,
        renderShippingSection,
        renderBillingSection,
        renderPaymentSection,
        renderEnhancedPaymentSection,
    ];
    void legacyStepRenderers;

    if (cartItems.length === 0) {
        return (
            <div className={cn(theme.shell, 'flex min-h-screen flex-col')}>
                <Header />
                <main className="flex-1 px-4 pb-20 md:px-6">
                    <div className="mx-auto max-w-[720px]">
                        <CheckoutEmptyState variant={variant} />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className={cn(theme.shell, 'flex min-h-screen flex-col')}>
            <Header />

            <main className="flex-1 px-4 pb-20 md:px-6">
                <div className="mx-auto grid max-w-[1120px] gap-5 md:gap-6">
                    <CheckoutHero
                        variant={variant}
                        title="Pokladna"
                        description={description}
                        itemCount={itemCount}
                        itemLabel={getItemLabel(itemCount)}
                        shippingLabel={selectedShippingMethod?.label}
                    />

                    <CheckoutProgress
                        variant={variant}
                        progress={progress}
                        steps={stepsInfo}
                        currentStep={currentStep}
                        completedSteps={completedSteps}
                        onStepSelect={goToStep}
                    />

                    <div className={theme.grid}>
                        <div className={theme.main}>
                            <section className={theme.stage}>
                                <div>
                                    <p className={theme.eyebrow}>{isCustomerStep ? 'Etapa 1 / 2' : 'Etapa 2 / 2'}</p>
                                    <h2 className={theme.stageTitle}>
                                        {isCustomerStep ? 'Kontakt a fakturace' : 'Doprava a platba'}
                                    </h2>
                                </div>

                                {!isCustomerStep && (
                                    <button type="button" className={theme.stageBack} onClick={() => goToStep('customer')}>
                                        <ArrowLeft size={14} />
                                        Zpet na kontakt a fakturaci
                                    </button>
                                )}
                            </section>

                            {isCustomerStep ? renderCustomerBillingSection() : renderShippingPaymentSection()}
                        </div>

                        <CheckoutSummary
                            variant={variant}
                            subtotalPrice={subtotalPrice}
                            couponDiscountAmount={couponDiscountAmount}
                            firstPurchaseDiscountAmount={firstPurchaseDiscountAmount}
                            bonusDiscountAmount={bonusDiscountAmount}
                            discountedSubtotal={discountedSubtotal}
                            vatAmount={vatAmount}
                            shippingPrice={shippingPrice}
                            orderTotal={orderTotal}
                            selectedShippingMethod={selectedShippingMethod}
                            formData={formData}
                            paymentLabel={getPaymentLabel(formData.paymentProvider)}
                            formatPrice={formatPrice}
                            loyaltySummary={
                                currentUser
                                    ? {
                                          balance: quote?.loyalty?.bonusBalance ?? currentUser.bonusBalance ?? 0,
                                          spent: quote?.loyalty?.bonusUnitsSpent ?? 0,
                                          earned: quote?.loyalty?.bonusUnitsEarned ?? 0,
                                      }
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

