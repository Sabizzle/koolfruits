export interface BusinessConfig {
  name: string
  tagline: string
  whatsAppNumber: string
  currency: string
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  photoUrl: string | null
  soldOut: boolean
}

export interface DeliveryArea {
  id: number
  name: string
  deliveryFee: number
}

export type PreferredTimeType = "Asap" | "Scheduled"
export type PaymentMethod = "CashOnDelivery" | "BankTransfer"
export type OrderStatus = "New" | "Preparing" | "OutForDelivery" | "Delivered"

export interface CreateOrderItemRequest {
  productId: number
  quantity: number
}

export interface CreateOrderRequest {
  customerName: string
  customerPhone: string
  deliveryAreaId: number
  streetAddress: string
  landmarkDirections?: string
  preferredTime: PreferredTimeType
  scheduledTime?: string | null
  paymentMethod: PaymentMethod
  note?: string
  items: CreateOrderItemRequest[]
}

export interface OrderItemResponse {
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface OrderResponse {
  orderNumber: string
  status: OrderStatus
  isPaid: boolean
  customerName: string
  customerPhone: string
  deliveryAreaName: string | null
  deliveryFee: number
  streetAddress: string
  landmarkDirections: string | null
  preferredTime: PreferredTimeType
  scheduledTime: string | null
  paymentMethod: PaymentMethod
  note: string | null
  subtotal: number
  total: number
  createdAt: string
  items: OrderItemResponse[]
}

export interface ApiValidationError {
  title: string
  status: number
  errors: Record<string, string[]>
}

export interface AdminOrder {
  id: number
  orderNumber: string
  status: OrderStatus
  isPaid: boolean
  customerName: string
  customerPhone: string
  deliveryAreaName: string | null
  deliveryFee: number
  streetAddress: string
  landmarkDirections: string | null
  preferredTime: PreferredTimeType
  scheduledTime: string | null
  paymentMethod: PaymentMethod
  note: string | null
  subtotal: number
  total: number
  createdAt: string
  items: OrderItemResponse[]
}

export interface AdminUser {
  username: string
}

export interface CustomerSummary {
  id: number
  name: string
  phone: string
  addresses: string[]
  orderCount: number
  totalSpent: number
  lastOrderAt: string
}

export interface ProductSales {
  productName: string
  quantity: number
  revenue: number
}

export interface SalesPeriod {
  revenue: number
  orderCount: number
  items: ProductSales[]
}

export interface SalesSummary {
  today: SalesPeriod
  thisWeek: SalesPeriod
  thisMonth: SalesPeriod
}

export interface AdminProduct {
  id: number
  name: string
  description: string | null
  price: number
  photoUrl: string | null
  soldOut: boolean
  sortOrder: number
}

export interface AdminDeliveryArea {
  id: number
  name: string
  deliveryFee: number
  isActive: boolean
  sortOrder: number
}
