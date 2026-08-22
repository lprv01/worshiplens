import type { Metadata } from 'next'
import InviteClient from './InviteClient'

export const metadata: Metadata = {
  title: "You're Invited",
  description:
    'Explore WorshipLens: theological reviews of worship songs. Songwriters can run their own lyrics through the five-lens analysis.',
  openGraph: {
    title: "You're invited to WorshipLens",
    description:
      'Theological reviews of worship songs. Songwriters, run your own lyrics through the five-lens analysis.',
    url: '/invite',
    siteName: 'WorshipLens',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "You're invited to WorshipLens",
    description: 'Theological reviews of worship songs, built for worship leaders and songwriters.',
    images: ['/og-image.png'],
  },
}

export default function InvitePage() {
  return <InviteClient />
}
