import { useAppData } from "../../context/AppDataContext"
import { formatMoney } from "../../lib/format"
import type { AdminOrder, OrderStatus } from "../../types"
import { telHref, whatsAppHref } from "../lib/phone"

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  New: { status: "Preparing", label: "Start preparing" },
  Preparing: { status: "OutForDelivery", label: "Out for delivery" },
  OutForDelivery: { status: "Delivered", label: "Mark delivered" },
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  New: "New",
  Preparing: "Preparing",
  OutForDelivery: "Out for delivery",
  Delivered: "Delivered",
}

interface Props {
  order: AdminOrder
  onAdvance: (status: OrderStatus) => void
  onTogglePaid: (isPaid: boolean) => void
  showTime?: boolean
}

export function OrderCard({ order, onAdvance, onTogglePaid, showTime }: Props) {
  const { config } = useAppData()
  const currency = config?.currency ?? "JMD"
  const next = NEXT_STATUS[order.status]

  const effectiveTime = order.preferredTime === "Scheduled" && order.scheduledTime ? order.scheduledTime : order.createdAt

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-base font-bold text-forest">{order.customerName}</p>
          <p className="text-xs text-gray-500">
            {order.orderNumber}
            {showTime && (
              <>
                {" · "}
                {new Date(effectiveTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                {order.preferredTime === "Scheduled" && " (scheduled)"}
              </>
            )}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-leaf/10 px-2.5 py-1 text-xs font-bold text-leaf-dark">
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <a href={telHref(order.customerPhone)} className="font-bold text-forest underline">
          {order.customerPhone}
        </a>
        <a
          href={whatsAppHref(order.customerPhone)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#25D366]/10 px-2 py-0.5 text-xs font-bold text-[#128C7E]"
        >
          WhatsApp
        </a>
      </div>

      <div className="text-sm text-gray-600">
        <p>
          {order.deliveryAreaName} — {order.streetAddress}
        </p>
        {order.landmarkDirections && <p className="italic">{order.landmarkDirections}</p>}
      </div>

      <ul className="flex flex-col gap-0.5 border-t border-black/5 pt-2 text-sm">
        {order.items.map((item) => (
          <li key={item.productName} className="flex justify-between">
            <span>
              {item.quantity} &times; {item.productName}
            </span>
            <span>{formatMoney(item.lineTotal, currency)}</span>
          </li>
        ))}
      </ul>

      {order.note && <p className="rounded-lg bg-pineapple/10 px-2 py-1 text-xs text-forest">Note: {order.note}</p>}

      <div className="flex items-center justify-between border-t border-black/5 pt-2">
        <span className="font-display text-base font-bold text-forest">{formatMoney(order.total, currency)}</span>
        <span className="text-xs text-gray-500">
          {order.paymentMethod === "CashOnDelivery" ? "Cash on delivery" : "Bank transfer"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onTogglePaid(!order.isPaid)}
          className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
            order.isPaid ? "bg-leaf/15 text-leaf-dark" : "bg-pineapple/20 text-forest"
          }`}
        >
          {order.isPaid ? "Paid ✓" : "Mark paid"}
        </button>
      </div>

      {next && (
        <button
          type="button"
          onClick={() => onAdvance(next.status)}
          className="rounded-full bg-forest py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98]"
        >
          {next.label}
        </button>
      )}
    </div>
  )
}
