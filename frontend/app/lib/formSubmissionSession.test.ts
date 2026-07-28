import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearFormSubmission, getSubmittedEmail, markFormSubmitted } from './formSubmissionSession';

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
