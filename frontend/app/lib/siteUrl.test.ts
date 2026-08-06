import { describe, expect, it } from 'vitest';

import { resolveSiteUrl } from './siteUrl';

describe('resolveSiteUrl', () => {
  it('prefers the configured URL over the request headers', () => {
    expect(
      resolveSiteUrl({
        configuredUrl: 'https://ccomplex.pl',
        host: 'complex-puce.vercel.app',
      }),
    ).toBe('https://ccomplex.pl');
  });

  it('adds https:// to a configured URL that has no scheme', () => {
    expect(resolveSiteUrl({ configuredUrl: 'ccomplex.pl' })).toBe('https://ccomplex.pl');
  });

  it('keeps an http:// configured URL as-is', () => {
    expect(resolveSiteUrl({ configuredUrl: 'http://localhost:3000' })).toBe(
      'http://localhost:3000',
    );
  });

  it('strips trailing slashes so entries do not end up with a double slash', () => {
    expect(resolveSiteUrl({ configuredUrl: 'https://ccomplex.pl///' })).toBe('https://ccomplex.pl');
  });

  it('ignores a blank configured URL and falls back to the host', () => {
    expect(resolveSiteUrl({ configuredUrl: '   ', host: 'complex-puce.vercel.app' })).toBe(
      'https://complex-puce.vercel.app',
    );
  });

  it('assumes https for a remote host with no forwarded protocol', () => {
    expect(resolveSiteUrl({ host: 'complex-puce.vercel.app' })).toBe(
      'https://complex-puce.vercel.app',
    );
  });

  it('assumes http for localhost', () => {
    expect(resolveSiteUrl({ host: 'localhost:3000' })).toBe('http://localhost:3000');
    expect(resolveSiteUrl({ host: '127.0.0.1:3000' })).toBe('http://127.0.0.1:3000');
  });

  it('honours x-forwarded-proto and takes the first hop of a proxy chain', () => {
    expect(resolveSiteUrl({ host: 'ccomplex.pl', forwardedProto: 'https, http' })).toBe(
      'https://ccomplex.pl',
    );
  });

  it('falls back to local dev when there is neither a config nor a host', () => {
    expect(resolveSiteUrl({})).toBe('http://localhost:3000');
    expect(resolveSiteUrl({ configuredUrl: null, host: null })).toBe('http://localhost:3000');
  });
});
