/**
 * Resolves the absolute origin used for canonical URLs (sitemap entries have to
 * be fully qualified — a bare host such as `example.com/oferta` is not a valid
 * `<loc>`).
 *
 * `NEXT_PUBLIC_SITE_URL` wins when set, so every environment agrees on one
 * canonical host. Preview deployments get a generated host that cannot be
 * pinned, so there we fall back to the incoming request headers.
 */

type SiteUrlSource = {
  /** Value of `NEXT_PUBLIC_SITE_URL`, with or without a scheme. */
  configuredUrl?: string | null;
  /** `host` request header, e.g. `complex-puce.vercel.app` or `localhost:3000`. */
  host?: string | null;
  /** `x-forwarded-proto` request header; may be a comma-separated proxy chain. */
  forwardedProto?: string | null;
};

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

function isLocalHost(host: string) {
  const hostname = host.split(':')[0];
  return LOCAL_HOSTS.includes(hostname);
}

export function resolveSiteUrl({ configuredUrl, host, forwardedProto }: SiteUrlSource): string {
  const configured = configuredUrl?.trim();
  if (configured) {
    const withScheme = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
    return stripTrailingSlash(withScheme);
  }

  const requestHost = host?.trim();
  // Nothing configured and no request context (e.g. a build-time call outside a
  // request) — assume local dev rather than emitting scheme-less URLs.
  if (!requestHost) return 'http://localhost:3000';

  // A proxy chain looks like `https,http`; the first hop is the client-facing one.
  const proto = forwardedProto?.split(',')[0]?.trim().toLowerCase();
  const scheme = proto || (isLocalHost(requestHost) ? 'http' : 'https');

  return stripTrailingSlash(`${scheme}://${requestHost}`);
}
