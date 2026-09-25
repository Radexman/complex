export interface ParsedPolishAddress {
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
}

const POSTAL_CODE_LOCALITY = /^(\d{2}-\d{3})\s+(.+)$/;

/**
 * Parses the free-text `footer.contactAddress` field (e.g. "Kępska 12, 45-130 Opole") into the
 * parts `PostalAddress` JSON-LD needs. Only the first two comma-separated segments are used — the
 * live value carries a third ("Kępska 12, 45-130 Opole, pok.20 (parter)") that isn't part of the
 * postal address. Returns `null` for anything that doesn't match the "street, XX-XXX city" shape,
 * so callers can fall back to emitting the address as plain text.
 */
export function parsePolishAddress(address: string): ParsedPolishAddress | null {
  const [streetAddress, cityPart] = address.split(',').map((part) => part.trim());
  if (!streetAddress || !cityPart) return null;

  const match = cityPart.match(POSTAL_CODE_LOCALITY);
  if (!match) return null;

  const [, postalCode, addressLocality] = match;
  return { streetAddress, postalCode, addressLocality };
}
