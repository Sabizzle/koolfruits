import { useCallback, useEffect, useState } from "react"
import { adminApi } from "../api"
import { OrderCard } from "../components/OrderCard"
import type { AdminOrder, OrderStatus } from "../../types"

export function Today() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    adminApi
      .getTodayOrders()
      .then((data) => {
        setOrders(data)
        setError(null)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load today's orders."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 20_000)
    return () => clearInterval(id)
  }, [load])

  const advanceStatus = async (id: number, status: OrderStatus) => {
    const updated = await adminApi.updateStatus(id, status)
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
  }

  const setPaid = async (id: number, isPaid: boolean) => {
    const updated = await adminApi.updatePaid(id, isPaid)
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
  }

  if (loading) {
    return <p className="p-4 text-forest">Loading today's orders…</p>
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
  }

  return (
    <div>
      <h1 className="font-display mb-3 text-lg font-bold text-forest">
        Today's orders <span className="text-sm font-normal text-gray-500">({orders.length})</span>
      </h1>

      {orders.length === 0 ? (
        <p className="rounded-xl bg-white/60 p-6 text-center text-gray-400">No orders due today yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              showTime
              onAdvance={(status) => void advanceStatus(order.id, status)}
              onTogglePaid={(isPaid) => void setPaid(order.id, isPaid)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
