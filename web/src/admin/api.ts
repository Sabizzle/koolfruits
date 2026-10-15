import { apiRequest } from "../api/client"
import type {
  AdminDeliveryArea,
  AdminOrder,
  AdminProduct,
  AdminUser,
  CreateOrderRequest,
  CustomerSummary,
  OrderStatus,
  SalesSummary,
} from "../types"

export const adminApi = {
  login: (username: string, password: string) =>
    apiRequest<AdminUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => apiRequest<void>("/api/auth/logout", { method: "POST" }),
  me: () => apiRequest<AdminUser>("/api/auth/me"),

  getOrders: (sinceDays = 2) => apiRequest<AdminOrder[]>(`/api/admin/orders?sinceDays=${sinceDays}`),
  getTodayOrders: () => apiRequest<AdminOrder[]>("/api/admin/orders/today"),
  createOrder: (order: CreateOrderRequest) =>
    apiRequest<AdminOrder>("/api/admin/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),
  updateStatus: (id: number, status: OrderStatus) =>
    apiRequest<AdminOrder>(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  updatePaid: (id: number, isPaid: boolean) =>
    apiRequest<AdminOrder>(`/api/admin/orders/${id}/paid`, {
      method: "PATCH",
      body: JSON.stringify({ isPaid }),
    }),

  getCustomers: () => apiRequest<CustomerSummary[]>("/api/admin/customers"),

  getSalesSummary: () => apiRequest<SalesSummary>("/api/admin/sales-summary"),

  getAdminProducts: () => apiRequest<AdminProduct[]>("/api/admin/products"),
  updateProduct: (id: number, data: { name: string; description?: string; price: number }) =>
    apiRequest<AdminProduct>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateProductSoldOut: (id: number, soldOut: boolean) =>
    apiRequest<AdminProduct>(`/api/admin/products/${id}/sold-out`, {
      method: "PATCH",
      body: JSON.stringify({ soldOut }),
    }),
  uploadProductPhoto: (id: number, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiRequest<AdminProduct>(`/api/admin/products/${id}/photo`, {
      method: "POST",
      body: form,
    })
  },

  getAdminAreas: () => apiRequest<AdminDeliveryArea[]>("/api/admin/delivery-areas"),
  createArea: (data: { name: string; deliveryFee: number; isActive: boolean }) =>
    apiRequest<AdminDeliveryArea>("/api/admin/delivery-areas", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateArea: (id: number, data: { name: string; deliveryFee: number; isActive: boolean }) =>
    apiRequest<AdminDeliveryArea>(`/api/admin/delivery-areas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}
