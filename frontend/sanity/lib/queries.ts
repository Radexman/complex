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
export const featuredProjectsQuery = defineQuery(
  `*[_type == "project" && isFeatured == true] | order(_createdAt desc){
    _id,
    title,
    city,
    category,
    coverImage
  }`,
);
