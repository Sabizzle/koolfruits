import type {
  ApiValidationError,
  BusinessConfig,
  CreateOrderRequest,
  DeliveryArea,
  OrderResponse,
  Product,
} from "../types"

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""

/**
 * Resolves a server-relative path (e.g. a product photo URL) against the API origin.
 * Needed because the API and web app can be deployed to different origins (see
 * DEPLOYMENT.md "Option A") — a bare `/product-photos/...` path would otherwise resolve
 * against the web app's own origin and 404.
 */
export function resolveMediaUrl(path: string | null): string | null {
  if (!path) return path
  return path.startsWith("/") ? `${BASE_URL}${path}` : path
}

export class ApiError extends Error {
  status: number
  validation?: ApiValidationError

  constructor(message: string, status: number, validation?: ApiValidationError) {
    super(message)
    this.status = status
    this.validation = validation
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: isFormData ? init?.headers : { "Content-Type": "application/json", ...init?.headers },
  })

  if (!res.ok) {
    let validation: ApiValidationError | undefined
    try {
      validation = await res.json()
    } catch {
      // response had no JSON body
    }
    const message = validation ? summarizeErrors(validation) : `Request failed (${res.status})`
    throw new ApiError(message, res.status, validation)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

function summarizeErrors(validation: ApiValidationError): string {
  const messages = Object.values(validation.errors ?? {}).flat()
  return messages.length > 0 ? messages.join(" ") : validation.title
}

export const api = {
  getConfig: () => apiRequest<BusinessConfig>("/api/config"),
  getProducts: () => apiRequest<Product[]>("/api/products"),
  getDeliveryAreas: () => apiRequest<DeliveryArea[]>("/api/delivery-areas"),
  createOrder: (order: CreateOrderRequest) =>
    apiRequest<OrderResponse>("/api/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),
  getOrder: (orderNumber: string, phone: string) =>
    apiRequest<OrderResponse>(`/api/orders/${orderNumber}?phone=${encodeURIComponent(phone)}`),
}
