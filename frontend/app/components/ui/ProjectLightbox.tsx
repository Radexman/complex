'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { X } from 'lucide-react';

import type {
  SanityImageAssetReference,
  SanityImageCrop,
  SanityImageHotspot,
} from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

/**
 * Minimal shape the lightbox needs. Matches the `coverImage` projection shared by
 * both `featuredProjectsQuery` and `allProjectsQuery`, so a project from either page
 * can be passed in directly.
 */
export interface LightboxProject {
  _id: string;
  title: string;
  city: string;
  coverImage?: {
    asset?: SanityImageAssetReference;
    media?: unknown;
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    alt?: string;
    _type: 'image';
  } | null;
}

/**
 * Fullscreen image lightbox shared by the home `FeaturedProjectsSection` and the
 * `/realizacje` `ProjectsGrid`. Controlled: pass the open project (or `null`) and an
 * `onClose` handler. The image and captions fade in together once the image loads,
 * so there's no caption-then-image pop.
 */
export default function ProjectLightbox({
  project,
  onClose,
}: {
  project: LightboxProject | null;
  onClose: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shownId, setShownId] = useState<string | null>(null);

  // Reset the load gate whenever a different project opens (render-time state
  // adjustment, not an effect). With no cover image there's nothing to wait for,
  // so reveal immediately.
  const currentId = project?._id ?? null;
  if (currentId !== shownId) {
    setShownId(currentId);
    setImageLoaded(project ? !project.coverImage?.asset : false);
  }

  const imageUrl = project?.coverImage?.asset
    ? urlForImage(project.coverImage).width(1600).quality(85).url()
    : undefined;

  return (
    <Dialog.Root
      open={project !== null}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md" />
        <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <Dialog.Content className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center">
            <Dialog.CloseTrigger className="absolute -top-2 right-0 z-10 cursor-pointer text-white transition-colors hover:text-accent md:-right-2 md:-top-10">
              <X size={28} aria-hidden="true" />
              <span className="sr-only">Zamknij</span>
            </Dialog.CloseTrigger>
            {imageUrl && !imageLoaded && (
              <span
                aria-hidden="true"
                className="absolute top-1/2 h-9 w-9 -translate-y-1/2 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
            )}
            {project && (
              <div
                className={`flex flex-col items-center transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={project.coverImage?.alt || project.title}
                    width={1600}
                    height={1200}
                    onLoad={() => setImageLoaded(true)}
                    className="max-h-[85vh] w-auto rounded-xl object-contain"
                  />
                )}
                <div className="mt-4 text-center">
                  <Dialog.Title className="font-heading text-xl font-bold text-white">
                    {project.title}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 font-body text-sm text-silver">
                    {project.city}
                  </Dialog.Description>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
