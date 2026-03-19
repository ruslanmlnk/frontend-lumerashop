const LOCAL_ASSET_MAP: Record<string, string> = {
  "https://lumerashop.cz/wp-content/uploads/2025/11/contact-bg-4.webp":
    "/assets/bg/contact-hero.webp",
  "https://lumerashop.cz/wp-content/uploads/2025/11/o-nas-bg-4.webp":
    "/assets/bg/about-hero.webp",
  "https://lumerashop.cz/wp-content/uploads/2025/11/o-lumerashop-4.webp":
    "/assets/about/our-journey.webp",
  "https://lumerashop.cz/wp-content/uploads/2025/11/o-lumerashop-2-4.jpg":
    "/assets/about/values.jpg",
  "https://lumerashop.cz/wp-content/uploads/2025/11/o-nas-cta-4.webp":
    "/assets/about/cta.webp",
  "https://lumerashop.cz/wp-content/uploads/2025/11/1151429-4.png":
    "/assets/contact/phone.png",
  "https://lumerashop.cz/wp-content/uploads/2025/11/15356610-4.png":
    "/assets/contact/email.png",
  "https://lumerashop.cz/wp-content/uploads/2025/11/15356639-4.png":
    "/assets/contact/social.png",
  "https://lumerashop.cz/wp-content/uploads/2025/11/d07f3e43-5.png":
    "/assets/icons/features/italian-origin.png",
  "https://lumerashop.cz/wp-content/uploads/2025/11/d58217d5-5.png":
    "/assets/icons/features/curated-selection.png",
  "https://lumerashop.cz/wp-content/uploads/2025/11/70e46ca5-5.png":
    "/assets/icons/features/free-delivery.png",
  "https://lumerashop.cz/wp-content/uploads/2025/11/eab46acd-5.png":
    "/assets/icons/features/personal-touch.png",
  "https://lumerashop.cz/wp-content/uploads/2026/02/%D0%94%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD-%D0%B1%D0%B5%D0%B7-%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-72.webp":
    "/assets/products/olivia-ruzova-1.webp",
  "https://lumerashop.cz/wp-content/uploads/2026/02/%D0%94%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD-%D0%B1%D0%B5%D0%B7-%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-73.webp":
    "/assets/products/olivia-ruzova-2.webp",
  "https://lumerashop.cz/wp-content/uploads/2026/02/%D0%94%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD-%D0%B1%D0%B5%D0%B7-%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-75.webp":
    "/assets/products/olivia-ruzova-3.webp",
  "https://lumerashop.cz/wp-content/uploads/2026/02/%D0%94%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD-%D0%B1%D0%B5%D0%B7-%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-76.webp":
    "/assets/products/olivia-ruzova-4.webp",
  "https://lumerashop.cz/wp-content/uploads/2025/11/OobchodeLumera-5.mp4":
    "/assets/videos/about.mp4",
};

export const DEFAULT_LOCAL_ASSET_FALLBACK = "/assets/products/olivia-ruzova.webp";

export const isRemoteAssetPath = (value: string): boolean =>
  value.startsWith("http://") || value.startsWith("https://");

const isPrivateHostname = (hostname: string): boolean => {
  const normalized = hostname.trim().toLowerCase();

  if (
    normalized === "localhost" ||
    normalized === "0.0.0.0" ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal")
  ) {
    return true;
  }

  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(normalized)) {
    return false;
  }

  const octets = normalized.split(".").map((part) => Number(part));
  const [first = 0, second = 0] = octets;

  if (first === 10 || first === 127) {
    return true;
  }

  if (first === 169 && second === 254) {
    return true;
  }

  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }

  return first === 192 && second === 168;
};

export const getLocalAssetPath = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return LOCAL_ASSET_MAP[normalized] ?? normalized;
};

export const getRenderableAssetPath = (
  value: string | null | undefined,
  fallback = DEFAULT_LOCAL_ASSET_FALLBACK,
): string => {
  const normalized = getLocalAssetPath(value);

  if (!normalized) {
    return fallback;
  }

  if (isRemoteAssetPath(normalized)) {
    return fallback;
  }

  return normalized;
};

export const getStoredAssetPath = (
  value: string | null | undefined,
  fallback = DEFAULT_LOCAL_ASSET_FALLBACK,
): string => {
  const normalized = getLocalAssetPath(value);

  if (!normalized) {
    return fallback;
  }

  return normalized;
};

export const getPayloadMediaProxyPath = (value: string): string =>
  `/api/payload-media/${encodeURIComponent(value)}`;

export const shouldProxyPayloadMedia = (baseUrl: string): boolean => {
  try {
    return isPrivateHostname(new URL(baseUrl).hostname);
  } catch {
    return true;
  }
};

export const getAbsolutePayloadAssetUrl = (value: string, baseUrl: string): string => {
  if (isRemoteAssetPath(value)) {
    return value;
  }

  return new URL(value.startsWith("/") ? value : `/${value.replace(/^\/+/, "")}`, `${baseUrl}/`).toString();
};

export const getRenderablePayloadMediaPath = (value: string, baseUrl: string): string => {
  const absoluteUrl = getAbsolutePayloadAssetUrl(value, baseUrl);

  if (shouldProxyPayloadMedia(baseUrl)) {
    return getPayloadMediaProxyPath(absoluteUrl);
  }

  return absoluteUrl;
};
