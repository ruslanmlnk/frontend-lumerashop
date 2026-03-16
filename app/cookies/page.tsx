import { INFO_PAGE_CONFIGS, buildInfoPageMetadata, renderInfoPage } from '@/lib/payload-info-pages'

export async function generateMetadata() {
  return buildInfoPageMetadata(INFO_PAGE_CONFIGS.cookies)
}

export default async function CookiesPage() {
  return renderInfoPage(INFO_PAGE_CONFIGS.cookies)
}
