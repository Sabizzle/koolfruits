import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { Product } from "../types"

export interface CartLine {
  productId: number
  name: string
  price: number
  photoUrl: string | null
  quantity: number
}

interface CartApi {
  lines: CartLine[]
  itemCount: number
  subtotal: number
  quantityOf: (productId: number) => number
  setQuantity: (product: Product, quantity: number) => void
  increment: (product: Product) => void
  decrement: (product: Product) => void
  clear: () => void
}

const CartContext = createContext<CartApi | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  const setQuantity = (product: Product, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) {
        return prev.filter((l) => l.productId !== product.id)
      }
      const existing = prev.find((l) => l.productId === product.id)
      if (existing) {
        return prev.map((l) => (l.productId === product.id ? { ...l, quantity } : l))
      }
      return [
        ...prev,
        { productId: product.id, name: product.name, price: product.price, photoUrl: product.photoUrl, quantity },
      ]
    })
  }

  const quantityOf = (productId: number) => lines.find((l) => l.productId === productId)?.quantity ?? 0

  const increment = (product: Product) => setQuantity(product, quantityOf(product.id) + 1)
  const decrement = (product: Product) => setQuantity(product, quantityOf(product.id) - 1)
  const clear = () => setLines([])

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines])
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.quantity, 0), [lines])

  return (
    <CartContext.Provider value={{ lines, itemCount, subtotal, quantityOf, setQuantity, increment, decrement, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
