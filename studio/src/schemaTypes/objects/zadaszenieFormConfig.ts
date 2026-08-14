import { ComponentIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * Fixed-id singleton holding configuration for the „Formularz Wyceny Zadaszenia”
 * (`/wycena/zadaszenie`) — currently just the header title/description, so the
 * client can edit the form's intro copy herself instead of it being hardcoded.
 */
export const zadaszenieFormConfig = defineType({
  name: 'zadaszenieFormConfig',
  title: 'Formularz Zadaszenia',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nagłówek formularza',
      description: 'Główny nagłówek nad formularzem wyceny.',
      type: 'string',
      initialValue: 'Formularz Wyceny Zadaszenia',
    }),
    defineField({
      name: 'description',
      title: 'Opis formularza',
      description: 'Krótki tekst pod nagłówkiem.',
      type: 'text',
      rows: 2,
      initialValue:
        'Wypełnij poniższy formularz, a przygotujemy bezpłatną wycenę i skontaktujemy się z Tobą w ciągu 3 dni roboczych.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Formularz Zadaszenia' };
    },
  },
});
