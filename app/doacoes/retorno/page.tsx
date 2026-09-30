import { DonationStatus } from './donation-status'

export default async function DonationReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>
}) {
  const { reference = '' } = await searchParams
  return <DonationStatus reference={reference} />
}
