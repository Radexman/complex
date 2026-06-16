import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import type {Settings} from '../../../sanity.types'

/**
 * Settings schema Singleton.  Singletons are single documents that are displayed not in a collection, handy for things like site settings and other global configurations.
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */

export const settings = defineType({
  name: 'settings',
  title: 'Ustawienia',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nazwa strony',
      description: 'Używana w nagłówku strony oraz jako tytuł w metadanych.',
      type: 'string',
      initialValue: 'Complex',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'navbar',
      title: 'Nawigacja',
      description: 'Logo i przycisk CTA w górnym pasku nawigacji.',
      type: 'navbar',
    }),
    defineField({
      name: 'hero',
      title: 'Sekcja Hero',
      description: 'Pełnoekranowa sekcja na górze strony głównej.',
      type: 'heroSection',
    }),
    defineField({
      name: 'trust',
      title: 'Sekcja Trust',
      description: 'Sekcja zaufania pod hero — statystyki i odznaki budujące wiarygodność.',
      type: 'trustSection',
    }),
    defineField({
      name: 'offer',
      title: 'Sekcja Oferta',
      description: 'Sekcja z ofertą — karty z daną usługą i odnośnikiem',
      type: 'offerSection',
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      description: 'Używany jako opis strony w metadanych.',
      type: 'array',
      of: [
        // A minified block content field for the description. https://www.sanity.io/docs/block-content
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      name: 'ogImage',
      title: 'Obraz Open Graph',
      type: 'image',
      description: 'Wyświetlany w kartach społecznościowych i wynikach wyszukiwania.',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        defineField({
          name: 'alt',
          description: 'Ważny dla dostępności i SEO.',
          title: 'Tekst alternatywny',
          type: 'string',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              const document = context.document as Settings
              if (document?.ogImage?.asset?._ref && !alt) {
                return 'Wymagane'
              }
              return true
            })
          },
        }),
        defineField({
          name: 'metadataBase',
          title: 'Adres bazowy metadanych',
          type: 'url',
          description: (
            <a
              href="https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase"
              rel="noreferrer noopener"
            >
              Więcej informacji
            </a>
          ),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Ustawienia',
      }
    },
  },
})
