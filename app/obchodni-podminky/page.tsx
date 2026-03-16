import { INFO_PAGE_CONFIGS, buildInfoPageMetadata, renderInfoPage } from '@/lib/payload-info-pages'

export async function generateMetadata() {
  return buildInfoPageMetadata(INFO_PAGE_CONFIGS.termsAndConditions)
}

export default async function ObchodniPodminkyPage() {
  return renderInfoPage(INFO_PAGE_CONFIGS.termsAndConditions)
}
