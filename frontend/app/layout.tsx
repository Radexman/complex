import './globals.css';

import { GoogleTagManager } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Inter, Bebas_Neue, Space_Grotesk } from 'next/font/google';
import { draftMode } from 'next/headers';
import { toPlainText } from 'next-sanity';
import { VisualEditing } from 'next-sanity/visual-editing';
import { Toaster } from 'sonner';

import AnnouncementBar from '@/app/components/AnnouncementBar';
import DraftModeToast from '@/app/components/DraftModeToast';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/Header';
import OrganizationJsonLd from '@/app/components/OrganizationJsonLd';
import * as demo from '@/sanity/lib/demo';
import { sanityFetch, SanityLive } from '@/sanity/lib/live';
import { settingsQuery } from '@/sanity/lib/queries';
import { resolveOpenGraphImage } from '@/sanity/lib/utils';
import { handleError } from '@/app/client-utils';

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({
    query: settingsQuery,
    // Metadata should never contain stega
    stega: false,
  });
  const title = settings?.title || demo.title;
  const description = settings?.description || demo.description;

  const ogImage = resolveOpenGraphImage(settings?.ogImage);
  let metadataBase: URL | undefined = undefined;
  try {
    metadataBase = settings?.ogImage?.metadataBase
      ? new URL(settings.ogImage.metadataBase)
      : undefined;
  } catch {
    // ignore
  }
  return {
    metadataBase,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  };
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Google Tag Manager container. One container rather than hardcoded Ads/GA4 tags
 * so the client's agency can add and change tags in the GTM panel without a
 * deploy here. Unset locally and in preview, where the tag simply isn't rendered.
 */
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <html lang="pl" className={`${inter.variable} ${bebasNeue.variable} ${spaceGrotesk.variable}`}>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body>
        <OrganizationJsonLd />
        {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
        <Toaster />
        {isDraftMode && (
          <>
            <DraftModeToast />
            {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
            <VisualEditing />
          </>
        )}
        {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered. */}
        <SanityLive onError={handleError} />
        {/* Fixed strip pinned to the viewport top — the banner and Navbar stack in
            normal flow inside it, so the Navbar rises on its own when the banner
            isn't rendered (disabled, expired, or dismissed). See Navbar.tsx. */}
        <div className="fixed inset-x-0 top-0 z-50">
          <AnnouncementBar />
          <Header />
        </div>
        <main>{children}</main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
