import type { Metadata } from 'next'

import GeneralInfoLayout from '@/components/info/GeneralInfoLayout'
import {
  getLocalAssetPath,
  getRenderableAssetPath,
  getRenderablePayloadMediaPath,
} from '@/lib/local-assets'
import { getGlobal } from '@/lib/payload-data'
import { renderLexicalToHTML } from '@/lib/payload-richtext'

export type InfoPageConfig = {
  globalSlug:
    | 'shipping-and-payment-page'
    | 'returns-and-complaints-page'
    | 'terms-and-conditions-page'
    | 'privacy-policy-page'
    | 'cookies-page'
  fallbackTitle: string
  fallbackDescription: string
  fallbackHeroImageUrl?: string
}

type PayloadInfoPageGlobal = {
  title?: string | null
  heroImage?: {
    url?: unknown
    filename?: unknown
  } | string | number | null
  heroImageUrl?: string | null
  content?: unknown
  seo?: {
    title?: string | null
    description?: string | null
  } | null
} | null

export const INFO_PAGE_CONFIGS = {
  shippingAndPayment: {
    globalSlug: 'shipping-and-payment-page',
    fallbackTitle: 'Doprava a platba',
    fallbackDescription:
      'Informace o moznostech dopravy, zpusobech platby, dodacich podminkach a kontaktech pro nakup v Lumera.',
    fallbackHeroImageUrl: 'https://lumerashop.cz/wp-content/uploads/2025/11/doprava-platba-4.webp',
  },
  returnsAndComplaints: {
    globalSlug: 'returns-and-complaints-page',
    fallbackTitle: 'Reklamace a vraceni',
    fallbackDescription:
      'Postup pro vraceni zbozi, reklamace, formulare ke stazeni a kontaktni informace pro Lumera.',
    fallbackHeroImageUrl: 'https://lumerashop.cz/wp-content/uploads/2025/11/reklamace-bg-4.webp',
  },
  termsAndConditions: {
    globalSlug: 'terms-and-conditions-page',
    fallbackTitle: 'Obchodni podminky',
    fallbackDescription:
      'Aktualni obchodni podminky e-shopu Lumera vcetne dopravy, plateb, reklamaci a odstoupeni od smlouvy.',
    fallbackHeroImageUrl: 'https://lumerashop.cz/wp-content/uploads/2025/11/obchodni-podminky-bg-4.webp',
  },
  privacyPolicy: {
    globalSlug: 'privacy-policy-page',
    fallbackTitle: 'Ochrana osobnich udaju',
    fallbackDescription:
      'Jak Lumera zpracovava osobni udaje zakazniku, pravni zaklady, doba uchovavani a vase prava podle GDPR.',
    fallbackHeroImageUrl: 'https://lumerashop.cz/wp-content/uploads/2025/11/privacy-policy-bg-4.webp',
  },
  cookies: {
    globalSlug: 'cookies-page',
    fallbackTitle: 'Zasady pouzivani souboru cookies',
    fallbackDescription:
      'Prehled pouzivanych cookies, jejich typu, spravy souhlasu a prav uzivatelu na webu Lumera.',
    fallbackHeroImageUrl: 'https://lumerashop.cz/wp-content/uploads/2025/11/cookies-bg-4.webp',
  },
} as const satisfies Record<string, InfoPageConfig>

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001'

const resolveUrl = (value: unknown, baseUrl: string): string | null => {
  if (typeof value !== 'string' || value.length === 0) {
    return null
  }

  const normalizedValue = getLocalAssetPath(value)
  if (!normalizedValue) {
    return null
  }

  if (normalizedValue.startsWith('/assets/')) {
    return normalizedValue
  }

  if (normalizedValue.startsWith('http://') || normalizedValue.startsWith('https://')) {
    if (normalizedValue.startsWith(baseUrl)) {
      return getRenderablePayloadMediaPath(normalizedValue, baseUrl)
    }

    return getRenderableAssetPath(normalizedValue, normalizedValue)
  }

  if (normalizedValue.startsWith('/')) {
    return getRenderablePayloadMediaPath(normalizedValue, baseUrl)
  }

  return getRenderablePayloadMediaPath(normalizedValue, baseUrl)
}

const resolveHeroImageUrl = (
  doc: PayloadInfoPageGlobal,
  baseUrl: string,
  fallbackHeroImageUrl?: string,
): string | null => {
  const mediaRelationUrl =
    typeof doc?.heroImage === 'object' && doc.heroImage
      ? resolveUrl(doc.heroImage.url ?? doc.heroImage.filename, baseUrl)
      : typeof doc?.heroImage === 'string'
        ? resolveUrl(doc.heroImage, baseUrl)
        : null

  return (
    mediaRelationUrl ||
    resolveUrl(doc?.heroImageUrl, baseUrl) ||
    resolveUrl(fallbackHeroImageUrl, baseUrl) ||
    null
  )
}

async function fetchInfoPage(config: InfoPageConfig) {
  const doc = (await getGlobal(config.globalSlug)) as PayloadInfoPageGlobal
  const baseUrl = (process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL).replace(/\/+$/, '')
  const title = doc?.title?.trim() || config.fallbackTitle
  const heroImageUrl = resolveHeroImageUrl(doc, baseUrl, config.fallbackHeroImageUrl)
  const seoTitle = doc?.seo?.title?.trim() || title
  const seoDescription = doc?.seo?.description?.trim() || config.fallbackDescription
  const contentHtml = renderLexicalToHTML(doc?.content)
    .replaceAll('<h2>', '<h3>')
    .replaceAll('</h2>', '</h3>')

  return {
    title,
    heroImageUrl,
    seoTitle,
    seoDescription,
    contentHtml,
  }
}

export async function buildInfoPageMetadata(config: InfoPageConfig): Promise<Metadata> {
  const page = await fetchInfoPage(config)

  return {
    title: page.seoTitle,
    description: page.seoDescription,
  }
}

export async function renderInfoPage(config: InfoPageConfig) {
  const page = await fetchInfoPage(config)

  return (
    <GeneralInfoLayout title={page.title} heroImageUrl={page.heroImageUrl}>
      {page.contentHtml ? (
        <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
      ) : (
        <p>Obsah teto stranky zatim neni k dispozici.</p>
      )}
    </GeneralInfoLayout>
  )
}
