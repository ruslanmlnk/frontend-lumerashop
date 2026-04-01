'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, MapPin, PackageOpen, RefreshCcw, X } from 'lucide-react';
import {
    formatPickupPointAddress,
    getPickupCarrierForMethod,
    type CheckoutPickupPoint,
    type PickupCarrier,
    type ShippingMethodId,
} from '@/lib/checkout-shipping';
import { cn, getCheckoutTheme } from '@/components/checkout/theme';
import type { CheckoutVariant } from '@/components/checkout/types';

declare global {
    interface Window {
        Packeta?: {
            Widget?: {
                pick: (
                    apiKey: string,
                    callback: (point: unknown) => void,
                    options?: Record<string, unknown>,
                ) => void;
            };
        };
    }
}

type PickupPointSelectorProps = {
    shippingMethodId: ShippingMethodId;
    country: string;
    selectedPoint: CheckoutPickupPoint | null;
    onSelect: (pickupPoint: CheckoutPickupPoint) => void;
    onErrorChange?: (message: string | null) => void;
    variant?: CheckoutVariant;
    displayMode?: 'standalone' | 'inline';
};

const PACKETA_WIDGET_SCRIPT_ID = 'packeta-widget-script';
const PACKETA_WIDGET_SCRIPT_URL = 'https://widget.packeta.com/v6/www/js/library.js';
const PACKETA_API_KEY = process.env.NEXT_PUBLIC_PACKETA_API_KEY?.trim() || '';

const PPL_WIDGET_MESSAGE_TYPE = 'lumera:ppl-pickup-selected';
const PPL_WIDGET_ERROR_TYPE = 'lumera:ppl-pickup-error';

const toNormalizedCountry = (country: string) => (country.toUpperCase() === 'SK' ? 'sk' : 'cz');

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === 'object' ? (value as Record<string, unknown>) : null;

const pickString = (...values: unknown[]) => {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
        if (typeof value === 'number' && Number.isFinite(value)) {
            return String(value);
        }
    }

    return '';
};

const loadScriptOnce = (id: string, src: string) =>
    new Promise<void>((resolve, reject) => {
        const existing = document.getElementById(id) as HTMLScriptElement | null;
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }

            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), {
                once: true,
            });
            return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
    });

const normalizePacketaPickupPoint = (value: unknown): CheckoutPickupPoint | null => {
    const point = asRecord(value);
    if (!point) return null;

    const id = pickString(point.id, point.carrierPickupPointId, point.pointId);
    const code = pickString(point.carrierPickupPointId, point.id, point.code);
    const name = pickString(point.name, point.place, point.fullName);

    if (!id && !name) {
        return null;
    }

    return {
        carrier: 'zasilkovna',
        id: id || code || name,
        code: code || id || undefined,
        name: name || code || id,
        street: pickString(point.street, point.address),
        city: pickString(point.city, point.cityName),
        zip: pickString(point.zip, point.postCode, point.postalCode),
        country: pickString(point.country, point.countryCode, 'CZ').toUpperCase(),
        type: pickString(point.pickupPointType, point.type, point.placeType),
        providerLabel: 'Zásilkovna',
    };
};

const unwrapPplPayload = (value: unknown): Record<string, unknown> | null => {
    const direct = asRecord(value);
    if (!direct) return null;

    if (
        pickString(
            direct.code,
            direct.id,
            direct.parcelshopCode,
            direct.parcelShopCode,
            direct.parcelshopName,
            direct.name,
        )
    ) {
        return direct;
    }

    const nested = [
        direct.detail,
        direct.point,
        direct.payload,
        direct.parcelshop,
        direct.parcelShop,
        direct.selectedPoint,
        direct.accessPoint,
    ];

    for (const candidate of nested) {
        const normalized = unwrapPplPayload(candidate);
        if (normalized) {
            return normalized;
        }
    }

    return null;
};

const normalizePplPickupPoint = (value: unknown): CheckoutPickupPoint | null => {
    const point = unwrapPplPayload(value);
    if (!point) return null;

    const code = pickString(point.code, point.id, point.parcelshopCode, point.parcelShopCode, point.parcelshop);
    const name = pickString(point.parcelshopName, point.parcelShopName, point.name, point.label, code);

    if (!code || !name) {
        return null;
    }

    return {
        carrier: 'ppl',
        id: code,
        code,
        name,
        street: pickString(point.street, point.address, point.addressStreet),
        city: pickString(point.city, point.town),
        zip: pickString(point.zip, point.zipCode, point.postalCode),
        country: pickString(point.country, point.countryCode, 'CZ').toUpperCase(),
        type: pickString(point.accessPointType, point.type, point.pickupPointType),
        providerLabel: 'PPL',
    };
};

const getActionLabel = (carrier: PickupCarrier, hasSelection: boolean) => {
    if (carrier === 'ppl') {
        return hasSelection ? 'Změnit PPL místo' : 'Vybrat PPL místo / box';
    }

    return hasSelection ? 'Změnit Zásilkovnu' : 'Vybrat Zásilkovnu / Z-BOX';
};

const getEyebrowLabel = (carrier: PickupCarrier) =>
    carrier === 'ppl' ? 'PPL Pickup' : 'Zásilkovna Pickup';

export default function PickupPointSelector({
    shippingMethodId,
    country,
    selectedPoint,
    onSelect,
    onErrorChange,
    variant = 'refined',
    displayMode = 'standalone',
}: PickupPointSelectorProps) {
    const carrier = useMemo(() => getPickupCarrierForMethod(shippingMethodId), [shippingMethodId]);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [isPplModalOpen, setIsPplModalOpen] = useState(false);
    const [isPplFrameLoading, setIsPplFrameLoading] = useState(false);
    const [pplReloadKey, setPplReloadKey] = useState(0);
    const theme = getCheckoutTheme(variant);
    const isInline = displayMode === 'inline';

    useEffect(() => {
        onErrorChange?.(localError);
    }, [localError, onErrorChange]);

    useEffect(() => {
        if (carrier !== 'ppl') {
            setIsPplModalOpen(false);
            setIsPplFrameLoading(false);
            setLocalError(null);
        }
    }, [carrier]);

    useEffect(() => {
        if (!isPplModalOpen) {
            return;
        }

        setIsPplFrameLoading(true);
    }, [isPplModalOpen, pplReloadKey]);

    useEffect(() => {
        if (carrier !== 'ppl') {
            return;
        }

        const handleMessage = (event: MessageEvent<unknown>) => {
            if (event.origin !== window.location.origin) {
                return;
            }

            const payload = asRecord(event.data);
            if (!payload) {
                return;
            }

            if (payload.type === PPL_WIDGET_MESSAGE_TYPE) {
                const point = normalizePplPickupPoint(payload.payload);
                if (!point) {
                    return;
                }

                setLocalError(null);
                onSelect(point);
                setIsPplModalOpen(false);
                return;
            }

            if (payload.type === PPL_WIDGET_ERROR_TYPE) {
                const message = pickString(payload.message);
                if (message) {
                    setLocalError(message);
                }
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [carrier, onSelect]);

    if (!carrier) {
        return null;
    }

    const pointAddress =
        selectedPoint && formatPickupPointAddress(selectedPoint)
            ? formatPickupPointAddress(selectedPoint)
            : selectedPoint?.providerLabel || selectedPoint?.code || '';

    const pplIframeSrc = (() => {
        const params = new URLSearchParams({
            country: toNormalizedCountry(country),
            seed: String(pplReloadKey),
        });

        if (selectedPoint?.carrier === 'ppl' && selectedPoint.code) {
            params.set('parcelshop', selectedPoint.code);
        }

        return `/ppl-widget.html?${params.toString()}`;
    })();

    const openSelector = async () => {
        setLocalError(null);

        if (carrier === 'ppl') {
            setIsPplModalOpen(true);
            return;
        }

        if (!PACKETA_API_KEY) {
            setLocalError('Chybí NEXT_PUBLIC_PACKETA_API_KEY, takže nelze otevřít mapu Zásilkovny.');
            return;
        }

        setIsBusy(true);

        try {
            await loadScriptOnce(PACKETA_WIDGET_SCRIPT_ID, PACKETA_WIDGET_SCRIPT_URL);

            if (!window.Packeta?.Widget?.pick) {
                throw new Error('Packeta widget is not available');
            }

            window.Packeta.Widget.pick(
                PACKETA_API_KEY,
                (value) => {
                    const point = normalizePacketaPickupPoint(value);
                    if (!point) {
                        return;
                    }

                    setLocalError(null);
                    onSelect(point);
                },
                {
                    country: toNormalizedCountry(country),
                    language: 'cs',
                },
            );
        } catch {
            setLocalError('Nepodařilo se otevřít mapu Zásilkovny.');
        } finally {
            setIsBusy(false);
        }
    };

    const renderSelectedPoint = () =>
        selectedPoint ? (
            <div
                className={cn(
                    'rounded-[10px] border px-3 py-2 text-[12px] leading-5',
                    variant === 'minimal'
                        ? 'border-[#e6ded1] bg-white text-[#4e473e]'
                        : 'border-black/8 bg-white/80 text-[#4e473e]',
                )}
            >
                <span className="font-semibold text-[#111]">Vybrané místo:</span>{' '}
                <span>
                    {selectedPoint.name}
                    {pointAddress ? `, ${pointAddress}` : ''}
                </span>
            </div>
        ) : null;

    const pplModal =
        carrier === 'ppl' && isPplModalOpen ? (
            <div
                className="fixed inset-0 z-[70] flex items-center justify-center p-2 md:p-4"
                role="dialog"
                aria-modal="true"
                aria-label="PPL pickup map"
            >
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                    onClick={() => setIsPplModalOpen(false)}
                />

                <div className="relative flex max-h-[99vh] w-full max-w-[1220px] flex-col gap-4 overflow-hidden rounded-[18px] border border-black/8 bg-white p-4 shadow-[0_24px_80px_rgba(17,17,17,0.24)] md:max-h-[96vh] md:p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a8f73]">
                                PPL Pickup
                            </p>
                            <h3 className="mt-1.5 text-[18px] font-semibold leading-tight text-[#111] md:text-[22px]">
                                Vyberte výdejní místo nebo box
                            </h3>
                        </div>

                        <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e5e7eb] bg-white text-[#111]"
                            onClick={() => setIsPplModalOpen(false)}
                            aria-label="Zavřít mapu"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-[13px] leading-5 text-[#6b7280]">
                            Po kliknutí na místo v mapě se výběr automaticky uloží do checkoutu.
                        </p>
                        <button
                            type="button"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111]"
                            onClick={() => setPplReloadKey((value) => value + 1)}
                        >
                            <RefreshCcw size={14} />
                            Obnovit mapu
                        </button>
                    </div>

                    <div className="relative h-[clamp(520px,78vh,920px)] overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-[#f8f8f8]">
                        {isPplFrameLoading && (
                            <div className="absolute inset-0 z-[2] flex items-center justify-center gap-2 bg-white/80 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#111]">
                                <Loader2 size={18} className="animate-spin" />
                                Načítám PPL mapu
                            </div>
                        )}

                        <iframe
                            key={pplIframeSrc}
                            src={pplIframeSrc}
                            title="PPL pickup map"
                            className="h-full w-full border-0"
                            onLoad={() => setIsPplFrameLoading(false)}
                        />
                    </div>
                </div>
            </div>
        ) : null;

    if (isInline) {
        return (
            <>
                <div className="grid gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a775f]">
                                {getEyebrowLabel(carrier)}
                            </p>
                            <p className="mt-1 text-[13px] font-medium leading-5 text-[#111]">
                                {selectedPoint?.name || 'Vyberte výdejní místo nebo box'}
                            </p>
                            <p className="mt-1 text-[12px] leading-5 text-[#6b6257]">
                                {selectedPoint
                                    ? pointAddress
                                    : carrier === 'ppl'
                                      ? 'Klikněte na tlačítko a vyberte si konkrétní PPL výdejní místo nebo box.'
                                      : 'Klikněte na tlačítko a vyberte si konkrétní Z-BOX nebo výdejní místo.'}
                            </p>
                        </div>

                        <button
                            type="button"
                            className={cn(theme.secondary, 'w-full sm:w-auto')}
                            onClick={openSelector}
                            disabled={isBusy}
                        >
                            {isBusy ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Načítám mapu
                                </>
                            ) : (
                                <>
                                    <MapPin size={15} />
                                    {getActionLabel(carrier, Boolean(selectedPoint))}
                                </>
                            )}
                        </button>
                    </div>

                    {renderSelectedPoint()}

                    {localError && <p className="text-[12px] leading-5 text-[#b42318]">{localError}</p>}
                </div>
                {pplModal}
            </>
        );
    }

    return (
        <>
            <div
                className={cn(
                    'flex flex-col gap-4 rounded-[12px] border p-4 md:flex-row md:items-center md:justify-between',
                    variant === 'minimal' ? 'border-[#ece5dc] bg-white' : 'border-black/8 bg-white/90',
                )}
            >
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a8f73]">
                        {getEyebrowLabel(carrier)}
                    </div>
                    <div className="mt-2 flex items-start gap-3">
                        <div className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#f0ddc3] text-[#111]">
                            <PackageOpen size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold leading-5 text-[#111]">
                                {selectedPoint?.name || 'Vyberte výdejní místo nebo box'}
                            </p>
                            <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
                                {selectedPoint
                                    ? pointAddress
                                    : 'Vybraná pobočka se uloží k objednávce a pošle se do platby.'}
                            </p>
                        </div>
                    </div>
                </div>

                <button type="button" className={theme.primary} onClick={openSelector} disabled={isBusy}>
                    {isBusy ? (
                        <>
                            <Loader2 size={15} className="animate-spin" />
                            Načítám mapu
                        </>
                    ) : (
                        <>
                            <MapPin size={15} />
                            {getActionLabel(carrier, Boolean(selectedPoint))}
                        </>
                    )}
                </button>
            </div>

            {renderSelectedPoint()}

            {localError && <p className="text-[12px] leading-5 text-[#b42318]">{localError}</p>}
            {pplModal}
        </>
    );
}
