import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { adminApi } from "../api"
import { playNewOrderChime } from "../lib/sound"
import type { AdminOrder, OrderStatus } from "../../types"

const POLL_INTERVAL_MS = 17_000

interface AdminOrdersApi {
  orders: AdminOrder[]
  loading: boolean
  error: string | null
  newOrderCount: number
  clearNewOrderBadge: () => void
  refresh: (opts?: { silent?: boolean }) => Promise<void>
  advanceStatus: (id: number, status: OrderStatus) => Promise<void>
  setPaid: (id: number, isPaid: boolean) => Promise<void>
}

const AdminOrdersContext = createContext<AdminOrdersApi | undefined>(undefined)

export function AdminOrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newOrderCount, setNewOrderCount] = useState(0)
  const knownIds = useRef<Set<number> | null>(null)

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const data = await adminApi.getOrders()
      setError(null)

      if (knownIds.current && !opts?.silent) {
        const freshIds = data.filter((o) => !knownIds.current!.has(o.id))
        if (freshIds.length > 0) {
          playNewOrderChime()
          setNewOrderCount((n) => n + freshIds.length)
        }
      }
      knownIds.current = new Set(data.map((o) => o.id))

      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [refresh])

  const advanceStatus = async (id: number, status: OrderStatus) => {
    const updated = await adminApi.updateStatus(id, status)
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
  }

  const setPaid = async (id: number, isPaid: boolean) => {
    const updated = await adminApi.updatePaid(id, isPaid)
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
  }

  const clearNewOrderBadge = () => setNewOrderCount(0)

  return (
    <AdminOrdersContext.Provider
      value={{ orders, loading, error, newOrderCount, clearNewOrderBadge, refresh, advanceStatus, setPaid }}
    >
      {children}
    </AdminOrdersContext.Provider>
  )
}

export function useAdminOrders() {
  const ctx = useContext(AdminOrdersContext)
  if (!ctx) throw new Error("useAdminOrders must be used within AdminOrdersProvider")
  return ctx
}
