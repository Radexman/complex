/**
 * Fallback values used for site metadata when Settings are not yet populated.
 */

export const title = 'Complex';

export const description = [
  {
    _key: 'fallback',
    _type: 'block',
    children: [
      {
        _key: 'fallback-span',
        _type: 'span',
        marks: [],
        text: 'A website built with Sanity and Next.js.',
      },
    ],
    markDefs: [],
    style: 'normal',
  },
];
