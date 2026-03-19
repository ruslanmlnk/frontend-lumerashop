'use client';
import { useMemo, useRef, useState, useEffect, useCallback, type PointerEvent as ReactPointerEvent } from 'react';

interface PriceFilterProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (range: [number, number]) => void;
    hideTitle?: boolean;
}

type DragHandle = 'from' | 'to' | null;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const PriceFilter = ({ min, max, value, onChange, hideTitle = false }: PriceFilterProps) => {
    const [from, to] = value;
    const [dragging, setDragging] = useState<DragHandle>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);

    const safeSpan = useMemo(() => Math.max(1, max - min), [min, max]);
    const left = useMemo(() => ((from - min) / safeSpan) * 100, [from, min, safeSpan]);
    const right = useMemo(() => ((to - min) / safeSpan) * 100, [to, min, safeSpan]);

    const updateFrom = useCallback((nextFrom: number) => {
        const safe = Number.isFinite(nextFrom) ? Math.round(nextFrom) : min;
        onChange([clamp(safe, min, to), to]);
    }, [min, onChange, to]);

    const updateTo = useCallback((nextTo: number) => {
        const safe = Number.isFinite(nextTo) ? Math.round(nextTo) : max;
        onChange([from, clamp(safe, from, max)]);
    }, [from, max, onChange]);

    const valueFromClientX = useCallback((clientX: number) => {
        const track = trackRef.current;
        if (!track) return from;

        const rect = track.getBoundingClientRect();
        if (rect.width <= 0) return from;

        const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
        return Math.round(min + ratio * safeSpan);
    }, [from, min, safeSpan]);

    const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        const next = valueFromClientX(event.clientX);
        const target: Exclude<DragHandle, null> = Math.abs(next - from) <= Math.abs(next - to) ? 'from' : 'to';
        setDragging(target);
        if (target === 'from') updateFrom(next);
        else updateTo(next);
    };

    const handleFromPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging('from');
    };

    const handleToPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging('to');
    };

    useEffect(() => {
        if (!dragging) return;

        const onPointerMove = (event: PointerEvent) => {
            const next = valueFromClientX(event.clientX);
            if (dragging === 'from') updateFrom(next);
            else updateTo(next);
        };

        const onPointerUp = () => setDragging(null);

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [dragging, updateFrom, updateTo, valueFromClientX]);

    return (
        <div className="w-full">
            {!hideTitle ? (
                <h3
                    className="mb-[10px] text-[18px] font-bold leading-[21.6px] text-[#111111]"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                    Cena
                </h3>
            ) : null}

            <div className="space-y-[10px]">
                <div className="px-2">
                    <div
                        ref={trackRef}
                        className="relative h-[34px] cursor-pointer py-[15px]"
                        onPointerDown={handleTrackPointerDown}
                    >
                        <div className="h-[4px] rounded-[4px] bg-[#111111]/30" />
                        <div
                            className="absolute top-[15px] h-[4px] rounded-[4px] bg-[#111111]"
                            style={{ left: `${left}%`, right: `${100 - right}%` }}
                        />

                        <button
                            type="button"
                            aria-label="Minimalni cena"
                            onPointerDown={handleFromPointerDown}
                            className="absolute top-1/2 h-[16px] w-[16px] -translate-y-1/2 rounded-full border-2 border-[#1E1E1E] bg-white"
                            style={{ left: `calc(${left}% - 8px)` }}
                        />
                        <button
                            type="button"
                            aria-label="Maximalni cena"
                            onPointerDown={handleToPointerDown}
                            className="absolute top-1/2 h-[16px] w-[16px] -translate-y-1/2 rounded-full border-2 border-[#1E1E1E] bg-white"
                            style={{ left: `calc(${right}% - 8px)` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex h-[43px] w-[60px] items-center rounded-[4px] border border-[#111111] bg-white px-2">
                        <input
                            type="number"
                            value={from}
                            onChange={(event) => updateFrom(Number(event.target.value))}
                            className="w-full bg-transparent text-[12px] leading-[24.5px] text-[#111111] outline-none"
                            aria-label="Cena od"
                        />
                    </label>

                    <label className="flex h-[43px] w-[60px] items-center rounded-[4px] border border-[#111111] bg-white px-2">
                        <input
                            type="number"
                            value={to}
                            onChange={(event) => updateTo(Number(event.target.value))}
                            className="w-full bg-transparent text-[12px] leading-[24.5px] text-[#111111] outline-none"
                            aria-label="Cena do"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default PriceFilter;
