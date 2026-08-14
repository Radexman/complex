/**
 * This config is used to configure your Sanity Studio.
 * Learn more: https://www.sanity.io/docs/configuration
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/schemaTypes';
import { structure } from './src/structure';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import {
  presentationTool,
  defineDocuments,
  defineLocations,
  type DocumentLocation,
} from 'sanity/presentation';
import { assist } from '@sanity/assist';

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

// URL for preview functionality, defaults to localhost:3000 if not set
const SANITY_STUDIO_PREVIEW_URL = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000';

// Origins the Presentation tool is allowed to load in its preview iframe and exchange
// postMessage events with. Declared explicitly so one bundle works for both local development
// and the deployed frontend — relying on the build-time preview URL alone allows only one of
// them. Add any new frontend domain here (e.g. a future ccomplex.pl) or Presentation will
// refuse to open it.
const PREVIEW_ALLOW_ORIGINS = ['http://localhost:*', 'https://complex-puce.vercel.app'];

// Define the home location for the presentation tool
const homeLocation = {
  title: 'Strona główna',
  href: '/',
} satisfies DocumentLocation;

// resolveHref() is a convenience function that resolves the URL
// path for different document types and used in the presentation tool.
function resolveHref(documentType?: string, slug?: string): string | undefined {
  switch (documentType) {
    case 'post':
      return slug ? `/posts/${slug}` : undefined;
    case 'page':
      return slug ? `/${slug}` : undefined;
    default:
      console.warn('Invalid document type:', documentType);
      return undefined;
  }
}

// Main Sanity configuration
export default defineConfig({
  name: 'default',
  title: 'Complex',

  projectId,
  dataset,

  plugins: [
    // Presentation tool configuration for Visual Editing
    presentationTool({
      previewUrl: {
        initial: SANITY_STUDIO_PREVIEW_URL,
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      allowOrigins: PREVIEW_ALLOW_ORIGINS,
      resolve: {
        // The Main Document Resolver API provides a method of resolving a main document from a given route or route pattern. https://www.sanity.io/docs/visual-editing/presentation-resolver-api#57720a5678d9
        mainDocuments: defineDocuments([
          {
            route: '/',
            filter: `_type == "settings" && _id == "siteSettings"`,
          },
          {
            route: '/realizacje',
            filter: `_type == "realizacjePage" && _id == "realizacjePage"`,
          },
          {
            route: '/tarasy',
            filter: `_type == "tarasyPage" && _id == "tarasyPage"`,
          },
          {
            route: '/oferta',
            filter: `_type == "ofertaPage" && _id == "ofertaPage"`,
          },
          {
            route: '/o-nas',
            filter: `_type == "aboutPage" && _id == "aboutPage"`,
          },
          {
            route: '/oferta/:slug',
            filter: `_type == "service" && slug.current == $slug || _id == $slug`,
          },
          {
            route: '/wycena',
            filter: `_type == "wycenaPage" && _id == "wycenaPage"`,
          },
          {
            route: '/wycena/taras',
            filter: `_type == "tarasFormConfig" && _id == "tarasFormConfig"`,
          },
          {
            route: '/wycena/zadaszenie',
            filter: `_type == "zadaszenieFormConfig" && _id == "zadaszenieFormConfig"`,
          },
          {
            route: '/wycena/zaluzje',
            filter: `_type == "zaluzjeFormConfig" && _id == "zaluzjeFormConfig"`,
          },
          {
            route: '/wycena/schody',
            filter: `_type == "schodyFormConfig" && _id == "schodyFormConfig"`,
          },
          {
            route: '/:slug',
            filter: `_type == "page" && slug.current == $slug || _id == $slug`,
          },
          {
            route: '/posts/:slug',
            filter: `_type == "post" && slug.current == $slug || _id == $slug`,
          },
        ]),
        // Locations Resolver API allows you to define where data is being used in your application. https://www.sanity.io/docs/visual-editing/presentation-resolver-api#8d8bca7bfcd7
        locations: {
          settings: defineLocations({
            locations: [homeLocation],
            message: 'Ten dokument jest używany na wszystkich stronach',
            tone: 'positive',
          }),
          navbar: defineLocations({
            locations: [homeLocation],
            message: 'Nawigacja jest używana na wszystkich stronach',
            tone: 'positive',
          }),
          heroSection: defineLocations({
            locations: [homeLocation],
            message: 'Sekcja Hero jest używana na stronie głównej',
            tone: 'positive',
          }),
          trustSection: defineLocations({
            locations: [homeLocation],
            message: 'Sekcja Trust jest używana na stronie głównej',
            tone: 'positive',
          }),
          offerSection: defineLocations({
            locations: [homeLocation],
            message: 'Sekcja Oferta jest używana na stronie głównej',
            tone: 'positive',
          }),
          aboutSection: defineLocations({
            locations: [homeLocation],
            message: 'Sekcja O nas jest używana na stronie głównej',
            tone: 'positive',
          }),
          featuredProjectsSection: defineLocations({
            locations: [homeLocation],
            message: 'Sekcja Realizacje jest używana na stronie głównej',
            tone: 'positive',
          }),
          beforeAfterSection: defineLocations({
            locations: [homeLocation],
            message: 'Sekcja Przed i po jest używana na stronie głównej',
            tone: 'positive',
          }),
          vatHighlightSection: defineLocations({
            locations: [homeLocation],
            message: 'Sekcja VAT jest używana na stronie głównej i podstronach oferty',
            tone: 'positive',
          }),
          realizacjePage: defineLocations({
            locations: [{ title: 'Realizacje', href: '/realizacje' }],
            message: 'Nagłówek strony „Realizacje”',
            tone: 'positive',
          }),
          wycenaPage: defineLocations({
            locations: [{ title: 'Wycena', href: '/wycena' }],
            message: 'Strona wyboru formularza wyceny',
            tone: 'positive',
          }),
          tarasyPage: defineLocations({
            locations: [{ title: 'Tarasy', href: '/tarasy' }],
            message: 'Nagłówek strony „Tarasy”',
            tone: 'positive',
          }),
          ofertaPage: defineLocations({
            locations: [{ title: 'Oferta', href: '/oferta' }],
            message: 'Nagłówek strony „Oferta”',
            tone: 'positive',
          }),
          aboutPage: defineLocations({
            locations: [{ title: 'O nas', href: '/o-nas' }],
            message: 'Treść strony „O nas”',
            tone: 'positive',
          }),
          bottomCtaSection: defineLocations({
            locations: [homeLocation],
            message: 'Sekcja CTA / Salon jest używana na stronie głównej',
            tone: 'positive',
          }),
          processTimeline: defineLocations({
            locations: [homeLocation],
            message: 'Sekcja Proces jest używana na stronie głównej i podstronach oferty',
            tone: 'positive',
          }),
          footer: defineLocations({
            locations: [homeLocation],
            message: 'Stopka jest używana na wszystkich stronach',
            tone: 'positive',
          }),
          tarasFormConfig: defineLocations({
            locations: [{ title: 'Formularz Wyceny Tarasu', href: '/wycena/taras' }],
            message: 'Kształty tarasu są używane w formularzu wyceny tarasu',
            tone: 'positive',
          }),
          zadaszenieFormConfig: defineLocations({
            locations: [{ title: 'Formularz Wyceny Zadaszenia', href: '/wycena/zadaszenie' }],
            message: 'Nagłówek i opis są używane w formularzu wyceny zadaszenia',
            tone: 'positive',
          }),
          zaluzjeFormConfig: defineLocations({
            locations: [{ title: 'Formularz Wyceny Żaluzji', href: '/wycena/zaluzje' }],
            message: 'Nagłówek i opis są używane w formularzu wyceny żaluzji',
            tone: 'positive',
          }),
          schodyFormConfig: defineLocations({
            locations: [{ title: 'Formularz Wyceny Schodów', href: '/wycena/schody' }],
            message: 'Schemat wymiarów jest używany w formularzu wyceny schodów',
            tone: 'positive',
          }),
          service: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Oferta',
                  href: doc?.slug ? `/oferta/${doc.slug}` : '/',
                },
                // Every service also appears as a card on the offer index page.
                { title: 'Oferta', href: '/oferta' },
              ],
            }),
          }),
          project: defineLocations({
            select: { title: 'title', city: 'city' },
            resolve: (doc) => ({
              locations: [
                {
                  title: 'Realizacje',
                  href: '/realizacje',
                },
                {
                  title: doc?.title || 'Realizacja',
                  href: '/',
                },
              ],
            }),
          }),
          page: defineLocations({
            select: {
              name: 'name',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.name || 'Untitled',
                  href: resolveHref('page', doc?.slug)!,
                },
              ],
            }),
          }),
          post: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: resolveHref('post', doc?.slug)!,
                },
                {
                  title: 'Home',
                  href: '/',
                } satisfies DocumentLocation,
              ].filter(Boolean) as DocumentLocation[],
            }),
          }),
        },
      },
    }),
    structureTool({
      structure, // Custom studio structure configuration, imported from ./src/structure.ts
    }),
    // Additional plugins for enhanced functionality
    unsplashImageAsset(),
    assist(),
    visionTool(),
  ],

  // Schema configuration, imported from ./src/schemaTypes/index.ts
  schema: {
    types: schemaTypes,
  },
});
