import 'server-only';

const DEFAULT_SITE_URL = 'http://127.0.0.1:3000';

export const getSiteUrl = () =>
    (process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, '');

export const toAbsoluteSiteUrl = (value: string, siteUrl = getSiteUrl()) => {
    if (!value) {
        return siteUrl;
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
};
