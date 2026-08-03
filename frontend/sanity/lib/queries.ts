import { defineQuery } from 'next-sanity';

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`);
export const navbarQuery = defineQuery(`*[_type == "navbar"][0]`);
export const heroQuery = defineQuery(`*[_type == "heroSection"][0]`);
export const trustQuery = defineQuery(`*[_type == "trustSection"][0]`);
export const offerQuery = defineQuery(`*[_type == "offerSection"][0]`);
export const aboutQuery = defineQuery(`*[_type == "aboutSection"][0]`);
export const featuredProjectsSectionQuery = defineQuery(
  `*[_type == "featuredProjectsSection"][0]`,
);
export const realizacjePageQuery = defineQuery(`*[_type == "realizacjePage"][0]`);
export const tarasyPageQuery = defineQuery(`*[_type == "tarasyPage"][0]`);
export const ofertaPageQuery = defineQuery(`*[_type == "ofertaPage"][0]`);
export const wycenaPageQuery = defineQuery(`*[_type == "wycenaPage"][0]`);

/**
 * Every offer, ordered by the editor-controlled `order` field, for the `/oferta`
 * index grid. Services without an `order` sort last (99 is the schema default).
 */
export const allServicesQuery = defineQuery(
  `*[_type == "service" && defined(slug.current)] | order(coalesce(order, 99) asc, title asc){
    _id,
    title,
    "slug": slug.current,
    heroImage,
    heroSubheadline,
    category,
    relatedFormSlug
  }`,
);

/** The three terrace offers shown on the `/tarasy` landing page (order applied in code). */
export const terraceServicesQuery = defineQuery(
  `*[_type == "service" && slug.current in ["tarasy-kompozytowe", "tarasy-gresowe", "tarasy-drewniane"]]{
    _id,
    title,
    "slug": slug.current,
    heroImage,
    heroSubheadline,
    category
  }`,
);
export const beforeAfterQuery = defineQuery(`*[_type == "beforeAfterSection"][0]`);
export const vatHighlightQuery = defineQuery(`*[_type == "vatHighlightSection"][0]`);
export const bottomCtaQuery = defineQuery(`*[_type == "bottomCtaSection"][0]`);
export const processTimelineQuery = defineQuery(`*[_type == "processTimeline"][0]`);
export const footerQuery = defineQuery(`*[_type == "footer"][0]`);
export const tarasFormConfigQuery = defineQuery(
  `*[_type == "tarasFormConfig"][0]{
    shapes[]{
      _key,
      shapeNumber,
      label,
      image,
      sides
    }
  }`,
);
export const schodyFormConfigQuery = defineQuery(
  `*[_type == "schodyFormConfig"][0]{
    diagram
  }`,
);
export const featuredProjectsQuery = defineQuery(
  `*[_type == "project" && isFeatured == true] | order(_createdAt desc){
    _id,
    title,
    city,
    category,
    coverImage
  }`,
);
export const allProjectsQuery = defineQuery(
  `*[_type == "project"] | order(_createdAt desc){
    _id,
    title,
    city,
    category,
    surface,
    coverImage
  }`,
);

export const galleryProjectsByCategoryQuery = defineQuery(
  `*[_type == "project" && category == $category] | order(_createdAt desc){
    _id,
    title,
    city,
    category,
    coverImage
  }`,
);

export const serviceSlugsQuery = defineQuery(
  `*[_type == "service" && defined(slug.current)]{ "slug": slug.current }`,
);

export const serviceBySlugQuery = defineQuery(
  `*[_type == "service" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    seoDescription,
    heroImage,
    heroHeadline,
    heroSubheadline,
    relatedFormSlug,
    category,
    benefitsEyebrow,
    benefitsHeadline,
    benefitsDescription,
    benefits[]{
      _key,
      icon,
      title,
      description
    },
    brandsEyebrow,
    brandsHeadline,
    brandsDescription,
    brands[]{
      _key,
      name,
      shortDescription,
      fullDescription,
      image,
      specs
    },
    techSpecsHeadline,
    techSpecsDescription,
    techSpecs[]{
      _key,
      icon,
      title,
      content
    },
    formCtaHeadline,
    formCtaSubheadline,
    formCtaButtonLabel,
    formCtaBullets
  }`,
);
