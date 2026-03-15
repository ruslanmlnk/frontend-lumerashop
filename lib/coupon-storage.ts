const PENDING_COUPON_STORAGE_KEY = 'lumera_pending_coupon'
const PENDING_COUPON_COOKIE = 'lumera_pending_coupon'
export const PENDING_COUPON_EVENT = 'lumera:coupon-persisted'

export const sanitizeCouponCode = (value: unknown) =>
    (typeof value === 'string' ? value : '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9-]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '')

const readCookieValue = (name: string) => {
    if (typeof document === 'undefined') {
        return ''
    }

    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1] || '') : ''
}

export const readPendingCoupon = () => {
    if (typeof window === 'undefined') {
        return ''
    }

    const fromStorage = sanitizeCouponCode(window.localStorage.getItem(PENDING_COUPON_STORAGE_KEY) || '')
    if (fromStorage) {
        return fromStorage
    }

    return sanitizeCouponCode(readCookieValue(PENDING_COUPON_COOKIE))
}

export const persistPendingCoupon = (value: unknown) => {
    const normalizedCode = sanitizeCouponCode(value)
    if (!normalizedCode || typeof window === 'undefined') {
        return ''
    }

    window.localStorage.setItem(PENDING_COUPON_STORAGE_KEY, normalizedCode)
    document.cookie = `${PENDING_COUPON_COOKIE}=${encodeURIComponent(normalizedCode)}; path=/; max-age=2592000; SameSite=Lax`
    window.dispatchEvent(new CustomEvent(PENDING_COUPON_EVENT, { detail: { couponCode: normalizedCode } }))
    return normalizedCode
}

export const clearPendingCoupon = () => {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.removeItem(PENDING_COUPON_STORAGE_KEY)
    document.cookie = `${PENDING_COUPON_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}
