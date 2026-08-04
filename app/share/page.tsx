import { redirect } from 'next/navigation'

// Destination for the wedding-program QR code.
// Defaults to WedUploader's homepage until the couple's real album link exists.
// Set NEXT_PUBLIC_SHARE_URL in Vercel once the album is created — no code change needed.
const SHARE_URL =
  process.env.NEXT_PUBLIC_SHARE_URL || 'https://weduploader.com'

export default function SharePage() {
  redirect(SHARE_URL)
}