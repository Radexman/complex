import type { ServiceBySlugQueryResult } from '@/sanity.types';

export type Service = NonNullable<ServiceBySlugQueryResult>;
export type Brand = NonNullable<Service['brands']>[number];
export type Variant = NonNullable<Brand['variants']>[number];
