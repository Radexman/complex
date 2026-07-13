/**
 * Builds Resend attachments from the photos a customer uploaded.
 *
 * Resend caps attachments at 40 MB *after* base64 encoding (~30 MB raw), and the
 * dropzone allows 3 × 10 MB — right at that line. So cap the total here and, when
 * a submission blows past it, drop the photos rather than fail the send: the lead
 * itself is worth far more than the pictures.
 */

export const MAX_ATTACHMENTS_BYTES = 20 * 1024 * 1024;

export interface EmailAttachment {
  filename: string;
  /** Inline file content. Mutually exclusive with `path`. */
  content?: Buffer;
  /** Remote URL for Resend to fetch (used for the Sanity-hosted diagrams). */
  path?: string;
}

export interface PhotoAttachmentsResult {
  attachments: EmailAttachment[];
  /** True when the photos were dropped for exceeding `MAX_ATTACHMENTS_BYTES`. */
  skipped: boolean;
  /** Names of the uploaded photos — listed in the email even when they were dropped. */
  filenames: string[];
}

export async function photosToAttachments(photos: File[]): Promise<PhotoAttachmentsResult> {
  const filenames = photos.map((photo) => photo.name);
  const totalBytes = photos.reduce((sum, photo) => sum + photo.size, 0);

  if (photos.length === 0) {
    return { attachments: [], skipped: false, filenames };
  }

  if (totalBytes > MAX_ATTACHMENTS_BYTES) {
    return { attachments: [], skipped: true, filenames };
  }

  const attachments = await Promise.all(
    photos.map(async (photo) => ({
      filename: photo.name,
      content: Buffer.from(await photo.arrayBuffer()),
    })),
  );

  return { attachments, skipped: false, filenames };
}
