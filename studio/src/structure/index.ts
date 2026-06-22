import {
  CheckmarkCircleIcon,
  CogIcon,
  ImageIcon,
  ImagesIcon,
  MenuIcon,
  RocketIcon,
  StarIcon,
  ThLargeIcon,
  UsersIcon,
} from '@sanity/icons';
import type { StructureBuilder, StructureResolver } from 'sanity/structure';

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 *
 * Each home-page section is a fixed-id singleton document, surfaced as its own sidebar entry.
 * Site-wide metadata (name, description, OG image) stays in the "Ustawienia / SEO" singleton.
 */

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Treść strony')
    .items([
      S.listItem()
        .title('Nawigacja')
        .icon(MenuIcon)
        .child(S.document().schemaType('navbar').documentId('navbar')),
      S.listItem()
        .title('Sekcja Hero')
        .icon(StarIcon)
        .child(S.document().schemaType('heroSection').documentId('heroSection')),
      S.listItem()
        .title('Sekcja Trust')
        .icon(CheckmarkCircleIcon)
        .child(S.document().schemaType('trustSection').documentId('trustSection')),
      S.listItem()
        .title('Sekcja Oferta')
        .icon(ThLargeIcon)
        .child(S.document().schemaType('offerSection').documentId('offerSection')),
      S.listItem()
        .title('Sekcja O nas')
        .icon(UsersIcon)
        .child(S.document().schemaType('aboutSection').documentId('aboutSection')),
      S.listItem()
        .title('Sekcja Realizacje')
        .icon(ImagesIcon)
        .child(
          S.document()
            .schemaType('featuredProjectsSection')
            .documentId('featuredProjectsSection'),
        ),
      S.listItem()
        .title('Sekcja CTA / Salon')
        .icon(RocketIcon)
        .child(S.document().schemaType('bottomCtaSection').documentId('bottomCtaSection')),
      S.divider(),
      S.listItem()
        .title('Realizacje')
        .icon(ImageIcon)
        .child(S.documentTypeList('project').title('Realizacje')),
      S.divider(),
      // Settings Singleton in order to view/edit the one particular document for Settings.  Learn more about Singletons: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
      S.listItem()
        .title('Ustawienia / SEO')
        .child(S.document().schemaType('settings').documentId('siteSettings'))
        .icon(CogIcon),
    ]);
