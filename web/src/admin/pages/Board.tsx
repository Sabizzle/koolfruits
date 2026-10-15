import { OrderCard } from "../components/OrderCard"
import { useAdminOrders } from "../context/AdminOrdersContext"
import type { AdminOrder, OrderStatus } from "../../types"

const COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: "New", label: "New" },
  { status: "Preparing", label: "Preparing" },
  { status: "OutForDelivery", label: "Out for delivery" },
  { status: "Delivered", label: "Delivered" },
]

export function Board() {
  const { orders, loading, error, advanceStatus, setPaid } = useAdminOrders()

  if (loading) {
    return <p className="p-4 text-forest">Loading orders…</p>
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
  }

  const byStatus = (status: OrderStatus): AdminOrder[] =>
    orders
      .filter((o) => o.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
      {COLUMNS.map((col) => {
        const columnOrders = byStatus(col.status)
        return (
          <div key={col.status} className="w-[85vw] shrink-0 snap-start sm:w-[360px]">
            <div className="mb-2 flex items-center gap-2 px-1">
              <h2 className="font-display text-base font-bold text-forest">{col.label}</h2>
              <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-bold text-forest">
                {columnOrders.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {columnOrders.length === 0 && (
                <p className="rounded-xl bg-white/60 p-4 text-center text-sm text-gray-400">No orders</p>
              )}
              {columnOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  showTime
                  onAdvance={(status) => void advanceStatus(order.id, status)}
                  onTogglePaid={(isPaid) => void setPaid(order.id, isPaid)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
