/** Normalizes a Jamaican phone number to E.164-ish digits for tel:/wa.me links. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) return `1${digits}`
  return digits
}

export function telHref(phone: string): string {
  return `tel:+${normalizePhone(phone)}`
}

export function whatsAppHref(phone: string): string {
  return `https://wa.me/${normalizePhone(phone)}`
}
