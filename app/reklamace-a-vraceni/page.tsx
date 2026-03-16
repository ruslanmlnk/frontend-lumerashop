import { INFO_PAGE_CONFIGS, buildInfoPageMetadata, renderInfoPage } from '@/lib/payload-info-pages'

export async function generateMetadata() {
  return buildInfoPageMetadata(INFO_PAGE_CONFIGS.returnsAndComplaints)
}

export default async function ReklamaceAVraceniPage() {
  return renderInfoPage(INFO_PAGE_CONFIGS.returnsAndComplaints)
}
