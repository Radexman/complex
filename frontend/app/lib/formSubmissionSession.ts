/**
 * Carries the "this visitor just submitted a form" signal from a quotation form
 * to its thank-you page (`/wycena/[type]/przeslany-formularz`).
 *
 * Deliberately not a query parameter: the submitted e-mail would end up in every
 * analytics pageview URL, which is exactly what we don't want to log.
 *
 * Two layers, because neither is enough on its own:
 *  - a module-level map, which survives a client-side `router.push` (same JS
 *    context) and works even when storage is blocked (Safari private mode,
 *    hardened browser settings);
 *  - `sessionStorage`, which additionally survives a page refresh and lives only
 *    for the browsing session.
 */

export type FormType = 'taras' | 'zadaszenie' | 'zaluzje' | 'schody' | 'kontakt';

const STORAGE_PREFIX = 'complex:form-submitted:';
const CONVERSION_PREFIX = 'complex:conversion-sent:';

const memoryStore = new Map<FormType, string>();
const conversionsSent = new Set<FormType>();

function storageKey(formType: FormType): string {
  return `${STORAGE_PREFIX}${formType}`;
}

function conversionKey(formType: FormType): string {
  return `${CONVERSION_PREFIX}${formType}`;
}

/** `sessionStorage` access throws outright when storage is disabled. */
function safeSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Records a successful submission. Call immediately before navigating to the
 * thank-you page.
 */
export function markFormSubmitted(formType: FormType, email: string): void {
  memoryStore.set(formType, email);
  try {
    safeSessionStorage()?.setItem(storageKey(formType), email);
  } catch {
    // Storage full or blocked — the in-memory fallback still covers the
    // client-side navigation that follows.
  }
}

/**
 * The e-mail submitted through `formType` in this session, or `null` when this
 * visitor has not submitted that form — i.e. landed on the thank-you URL
 * directly.
 *
 * Returns a plain string so the value is stable across calls (safe to read from
 * render).
 */
export function getSubmittedEmail(formType: FormType): string | null {
  const fromMemory = memoryStore.get(formType);
  if (fromMemory !== undefined) return fromMemory;

  try {
    return safeSessionStorage()?.getItem(storageKey(formType)) ?? null;
  } catch {
    return null;
  }
}

/** Drops the submission record — used by tests and any future "start over" flow. */
export function clearFormSubmission(formType: FormType): void {
  memoryStore.delete(formType);
  try {
    safeSessionStorage()?.removeItem(storageKey(formType));
  } catch {
    // Nothing to do — the in-memory record is already gone.
  }
}

/**
 * Claims the right to report one analytics conversion for `formType`, returning
 * `true` only the first time it is called for a given submission.
 *
 * Needed because the submission record above is deliberately *not* cleared once
 * read — that is what lets a refresh of the thank-you page still render the
 * confirmation. Without this guard, every refresh would report another
 * conversion, and React's development double-invoke would report two on the
 * first render alone.
 *
 * Mirrors the two-layer approach above: the in-memory set covers a remount in
 * the same JS context, `sessionStorage` covers a refresh.
 */
export function claimConversion(formType: FormType): boolean {
  if (conversionsSent.has(formType)) return false;

  const key = conversionKey(formType);
  try {
    // A value here means an earlier page load already reported this one.
    const alreadySent = safeSessionStorage()?.getItem(key) ?? null;
    if (alreadySent !== null) return false;
  } catch {
    // Storage unreadable — the in-memory set is then the only guard, which
    // still covers the case that matters most (a remount without a reload).
  }

  conversionsSent.add(formType);
  try {
    safeSessionStorage()?.setItem(key, '1');
  } catch {
    // Same as above: the in-memory set already holds the claim.
  }

  return true;
}

/** Drops the conversion claim — used by tests and any future "start over" flow. */
export function clearConversion(formType: FormType): void {
  conversionsSent.delete(formType);
  try {
    safeSessionStorage()?.removeItem(conversionKey(formType));
  } catch {
    // Nothing to do — the in-memory claim is already gone.
  }
}
