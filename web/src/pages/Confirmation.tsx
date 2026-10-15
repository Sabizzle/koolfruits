import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { api } from "../api/client"
import { useAppData } from "../context/AppDataContext"
import { useReturningCustomer } from "../hooks/useReturningCustomer"
import { formatMoney } from "../lib/format"
import type { OrderResponse } from "../types"

export function Confirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const location = useLocation()
  const { config } = useAppData()
  const [saved] = useReturningCustomer()

  const stateOrder = (location.state as { order?: OrderResponse } | null)?.order
  const [order, setOrder] = useState<OrderResponse | null>(stateOrder ?? null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (order || !orderNumber) return
    if (!saved.customerPhone) {
      setError("We couldn't find that order. Open the \"Send on WhatsApp\" link we gave you at checkout, or place a new order.")
      return
    }
    api
      .getOrder(orderNumber, saved.customerPhone)
      .then(setOrder)
      .catch(() => setError("We couldn't find that order."))
  }, [order, orderNumber, saved.customerPhone])

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-forest">{error}</p>
        <Link to="/" className="rounded-full bg-leaf px-5 py-2.5 text-sm font-bold text-white">
          Back to menu
        </Link>
      </div>
    )
  }

  if (!order) {
    return <div className="px-4 py-16 text-center text-forest">Loading your order…</div>
  }

  const currency = config?.currency ?? "JMD"
  const whatsAppUrl = config ? buildWhatsAppUrl(config.whatsAppNumber, order, currency) : undefined

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 pt-10 pb-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf text-3xl text-white">✓</div>

      <div>
        <h1 className="font-display text-xl font-bold text-forest">Order placed! 😊</h1>
        <p className="mt-1 text-sm text-gray-600">We will contact you soon.</p>
      </div>

      <div className="w-full rounded-2xl bg-white p-4 text-left shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Order number</span>
          <span className="font-display text-lg font-bold text-leaf-dark">{order.orderNumber}</span>
        </div>

        <ul className="flex flex-col gap-1 border-t border-black/5 pt-3 text-sm">
          {order.items.map((item) => (
            <li key={item.productName} className="flex justify-between">
              <span>
                {item.quantity} &times; {item.productName}
              </span>
              <span>{formatMoney(item.lineTotal, currency)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex flex-col gap-1 border-t border-black/5 pt-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery ({order.deliveryAreaName})</span>
            <span>{formatMoney(order.deliveryFee, currency)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-forest">
            <span>Total</span>
            <span>{formatMoney(order.total, currency)}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-0.5 border-t border-black/5 pt-3 text-sm text-gray-600">
          <span>{order.streetAddress}</span>
          {order.landmarkDirections && <span>{order.landmarkDirections}</span>}
          <span>
            {order.preferredTime === "Asap"
              ? "Delivery: as soon as possible"
              : `Delivery: ${order.scheduledTime ? new Date(order.scheduledTime).toLocaleString() : "scheduled"}`}
          </span>
          <span>Payment: {order.paymentMethod === "CashOnDelivery" ? "Cash on delivery" : "Bank transfer"}</span>
        </div>
      </div>

      {whatsAppUrl && (
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-base font-bold text-white shadow-md transition active:scale-[0.98]"
        >
          Send on WhatsApp
        </a>
      )}

      <Link to="/" className="text-sm font-bold text-leaf-dark">
        Back to menu
      </Link>
    </div>
  )
}

function buildWhatsAppUrl(whatsAppNumber: string, order: OrderResponse, currency: string): string {
  const lines = [
    `Hi Kool Fruits! Here's my order ${order.orderNumber}:`,
    "",
    ...order.items.map((i) => `${i.quantity} x ${i.productName} — ${formatMoney(i.lineTotal, currency)}`),
    "",
    `Subtotal: ${formatMoney(order.subtotal, currency)}`,
    `Delivery (${order.deliveryAreaName}): ${formatMoney(order.deliveryFee, currency)}`,
    `Total: ${formatMoney(order.total, currency)}`,
    "",
    `Address: ${order.streetAddress}${order.landmarkDirections ? ` (${order.landmarkDirections})` : ""}`,
    `Payment: ${order.paymentMethod === "CashOnDelivery" ? "Cash on delivery" : "Bank transfer"}`,
  ]

  const text = encodeURIComponent(lines.join("\n"))
  return `https://wa.me/${whatsAppNumber}?text=${text}`
}
