import { INFO_PAGE_CONFIGS, buildInfoPageMetadata, renderInfoPage } from '@/lib/payload-info-pages'

export async function generateMetadata() {
  return buildInfoPageMetadata(INFO_PAGE_CONFIGS.privacyPolicy)
}

export default async function OchranaOsobnichUdajuPage() {
  return renderInfoPage(INFO_PAGE_CONFIGS.privacyPolicy)
}
