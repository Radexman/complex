import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  claimConversion,
  clearConversion,
  clearFormSubmission,
  getSubmittedEmail,
  markFormSubmitted,
} from './formSubmissionSession';

/** Minimal in-memory stand-in for the browser's `sessionStorage`. */
function createFakeStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => void store.delete(key),
    setItem: (key: string, value: string) => void store.set(key, value),
  };
}

function stubWindow(sessionStorage: Storage | (() => never)) {
  vi.stubGlobal('window', {
    get sessionStorage() {
      return typeof sessionStorage === 'function' ? sessionStorage() : sessionStorage;
    },
  });
}

// The module keeps an in-memory fallback that outlives a single test.
function resetModuleState() {
  for (const formType of ['taras', 'zadaszenie', 'zaluzje', 'schody', 'kontakt'] as const) {
    clearFormSubmission(formType);
    clearConversion(formType);
  }
}

beforeEach(() => {
  resetModuleState();
});

afterEach(() => {
  resetModuleState();
  vi.unstubAllGlobals();
});

describe('formSubmissionSession', () => {
  it('returns null for a form that was never submitted', () => {
    stubWindow(createFakeStorage());
    expect(getSubmittedEmail('taras')).toBeNull();
  });

  it('round-trips the submitted e-mail', () => {
    stubWindow(createFakeStorage());
    markFormSubmitted('taras', 'jan@example.pl');
    expect(getSubmittedEmail('taras')).toBe('jan@example.pl');
  });

  it('keys submissions per form, so one form does not unlock another', () => {
    stubWindow(createFakeStorage());
    markFormSubmitted('taras', 'jan@example.pl');

    expect(getSubmittedEmail('zadaszenie')).toBeNull();
    expect(getSubmittedEmail('zaluzje')).toBeNull();
    expect(getSubmittedEmail('schody')).toBeNull();
  });

  it('persists to sessionStorage, so the record survives a page load', () => {
    const storage = createFakeStorage();
    stubWindow(storage);
    markFormSubmitted('schody', 'ewa@example.pl');

    // Simulate a fresh page load: storage survives, the module's memory does not.
    const persisted = storage.getItem('complex:form-submitted:schody');
    resetModuleState();
    storage.setItem('complex:form-submitted:schody', persisted as string);

    expect(getSubmittedEmail('schody')).toBe('ewa@example.pl');
  });

  it('falls back to memory when sessionStorage is unavailable', () => {
    // Safari private mode and hardened settings throw on property access.
    stubWindow(() => {
      throw new Error('SecurityError');
    });

    markFormSubmitted('zaluzje', 'ola@example.pl');
    expect(getSubmittedEmail('zaluzje')).toBe('ola@example.pl');
  });

  it('returns null on the server, where there is no session at all', () => {
    vi.stubGlobal('window', undefined);
    expect(getSubmittedEmail('zadaszenie')).toBeNull();
  });

  it('clears a submission', () => {
    const storage = createFakeStorage();
    stubWindow(storage);
    markFormSubmitted('kontakt', 'biuro@example.pl');

    clearFormSubmission('kontakt');

    expect(getSubmittedEmail('kontakt')).toBeNull();
    expect(storage.getItem('complex:form-submitted:kontakt')).toBeNull();
  });
});

describe('claimConversion', () => {
  it('grants the claim exactly once per form', () => {
    stubWindow(createFakeStorage());

    expect(claimConversion('taras')).toBe(true);
    expect(claimConversion('taras')).toBe(false);
    expect(claimConversion('taras')).toBe(false);
  });

  it('keys claims per form, so one conversion does not swallow another', () => {
    stubWindow(createFakeStorage());
    claimConversion('taras');

    expect(claimConversion('zadaszenie')).toBe(true);
    expect(claimConversion('kontakt')).toBe(true);
  });

  it('refuses a second claim after a page refresh', () => {
    const storage = createFakeStorage();
    stubWindow(storage);
    expect(claimConversion('zaluzje')).toBe(true);

    // Simulate a refresh of the thank-you page: sessionStorage survives, the
    // module's in-memory set does not. This is the double-count this guard exists
    // for — the submission record itself is deliberately never cleared.
    const persisted = storage.getItem('complex:conversion-sent:zaluzje');
    resetModuleState();
    storage.setItem('complex:conversion-sent:zaluzje', persisted as string);

    expect(claimConversion('zaluzje')).toBe(false);
  });

  it('still refuses a repeat claim when sessionStorage is unavailable', () => {
    // Storage throws (Safari private mode), so only the in-memory set can guard —
    // which still covers a remount without a reload.
    stubWindow(() => {
      throw new Error('SecurityError');
    });

    expect(claimConversion('schody')).toBe(true);
    expect(claimConversion('schody')).toBe(false);
  });

  it('does not consume the claim when a submission is only read', () => {
    stubWindow(createFakeStorage());
    markFormSubmitted('kontakt', 'biuro@example.pl');
    getSubmittedEmail('kontakt');

    expect(claimConversion('kontakt')).toBe(true);
  });

  it('clears a claim', () => {
    const storage = createFakeStorage();
    stubWindow(storage);
    claimConversion('taras');

    clearConversion('taras');

    expect(storage.getItem('complex:conversion-sent:taras')).toBeNull();
    expect(claimConversion('taras')).toBe(true);
  });
});
