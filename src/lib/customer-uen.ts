export const CUSTOMER_UEN_IF_EMPTY = "/";

export function normalizeCustomerUenForSave(raw: string | undefined | null): string {
  const t = raw?.trim();
  return t ? t : CUSTOMER_UEN_IF_EMPTY;
}

export function formatCustomerUenForDisplay(raw: string | undefined | null): string {
  return normalizeCustomerUenForSave(raw);
}

export function customerUenIsProvided(raw: string | undefined | null): boolean {
  const t = raw?.trim();
  return Boolean(t && t !== CUSTOMER_UEN_IF_EMPTY);
}
