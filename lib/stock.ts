export const normalizeStockQuantity = (value: unknown): number | undefined => {
    const numeric = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(numeric) || numeric < 0) {
        return undefined;
    }

    return Math.max(0, Math.floor(numeric));
};

export const clampQuantityToStock = (quantity: number, stockQuantity?: number) => {
    const normalizedQuantity = Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;

    if (typeof stockQuantity !== 'number') {
        return normalizedQuantity;
    }

    return Math.min(normalizedQuantity, stockQuantity);
};

export const getRemainingStock = (stockQuantity?: number, alreadySelected = 0) => {
    if (typeof stockQuantity !== 'number') {
        return undefined;
    }

    const normalizedSelected = Number.isFinite(alreadySelected) ? Math.max(0, Math.floor(alreadySelected)) : 0;
    return Math.max(0, stockQuantity - normalizedSelected);
};
