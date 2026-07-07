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
export const bottomCtaQuery = defineQuery(`*[_type == "bottomCtaSection"][0]`);
export const processTimelineQuery = defineQuery(`*[_type == "processTimeline"][0]`);
export const footerQuery = defineQuery(`*[_type == "footer"][0]`);
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
