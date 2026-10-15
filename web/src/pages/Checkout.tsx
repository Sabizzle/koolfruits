import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api, ApiError } from "../api/client"
import { useAppData } from "../context/AppDataContext"
import { useCart } from "../context/CartContext"
import { useReturningCustomer } from "../hooks/useReturningCustomer"
import { formatMoney } from "../lib/format"
import type { CreateOrderRequest, PaymentMethod } from "../types"

export function Checkout() {
  const { areas, config } = useAppData()
  const { lines, subtotal, clear } = useCart()
  const navigate = useNavigate()
  const [saved, setSaved] = useReturningCustomer()

  const [customerName, setCustomerName] = useState(saved.customerName)
  const [customerPhone, setCustomerPhone] = useState(saved.customerPhone)
  const [deliveryAreaId, setDeliveryAreaId] = useState<number | "">(saved.deliveryAreaId)
  const [streetAddress, setStreetAddress] = useState(saved.streetAddress)
  const [landmarkDirections, setLandmarkDirections] = useState(saved.landmarkDirections)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledTime, setScheduledTime] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CashOnDelivery")
  const [note, setNote] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currency = config?.currency ?? "JMD"
  const selectedArea = areas.find((a) => a.id === deliveryAreaId)
  const deliveryFee = selectedArea?.deliveryFee ?? 0
  const total = subtotal + deliveryFee

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-forest">Your cart is empty.</p>
        <Link to="/" className="rounded-full bg-leaf px-5 py-2.5 text-sm font-bold text-white">
          Browse products
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (deliveryAreaId === "") {
      setError("Please choose a delivery area.")
      return
    }
    if (isScheduled && !scheduledTime) {
      setError("Please choose a delivery time.")
      return
    }

    const payload: CreateOrderRequest = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAreaId,
      streetAddress: streetAddress.trim(),
      landmarkDirections: landmarkDirections.trim() || undefined,
      preferredTime: isScheduled ? "Scheduled" : "Asap",
      scheduledTime: isScheduled ? new Date(scheduledTime).toISOString() : undefined,
      paymentMethod,
      note: note.trim() || undefined,
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    }

    setSubmitting(true)
    try {
      const order = await api.createOrder(payload)
      setSaved({
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        deliveryAreaId,
        streetAddress: payload.streetAddress,
        landmarkDirections: landmarkDirections.trim(),
      })
      clear()
      navigate(`/confirmation/${order.orderNumber}`, { state: { order } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6 pb-10">
      <h1 className="font-display mb-4 text-xl font-bold text-forest">Checkout</h1>

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-bold text-forest">Your order</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {lines.map((l) => (
            <li key={l.productId} className="flex justify-between">
              <span>
                {l.quantity} &times; {l.name}
              </span>
              <span>{formatMoney(l.price * l.quantity, currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-col gap-1 border-t border-black/5 pt-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span>{selectedArea ? formatMoney(deliveryFee, currency) : "—"}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-forest">
            <span>Total</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Name">
          <input
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="input"
            placeholder="Your full name"
          />
        </Field>

        <Field label="Phone number">
          <input
            required
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="input"
            placeholder="876 xxx xxxx"
          />
        </Field>

        <Field label="Delivery area">
          <select
            required
            value={deliveryAreaId}
            onChange={(e) => setDeliveryAreaId(e.target.value ? Number(e.target.value) : "")}
            className="input"
          >
            <option value="" disabled>
              Choose your area
            </option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} {a.deliveryFee > 0 ? `(+${formatMoney(a.deliveryFee, currency)})` : "(free delivery)"}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Street address">
          <input
            required
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            className="input"
            placeholder="House/lot number, street"
          />
        </Field>

        <Field label="Landmark / directions" hint="Helps the driver find you">
          <textarea
            value={landmarkDirections}
            onChange={(e) => setLandmarkDirections(e.target.value)}
            className="input min-h-16 resize-none"
            placeholder="e.g. Blue gate next to the shop"
          />
        </Field>

        <Field label="Preferred delivery time">
          <div className="flex gap-2">
            <ToggleButton active={!isScheduled} onClick={() => setIsScheduled(false)}>
              ASAP
            </ToggleButton>
            <ToggleButton active={isScheduled} onClick={() => setIsScheduled(true)}>
              Pick a time
            </ToggleButton>
          </div>
          {isScheduled && (
            <input
              required
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="input mt-2"
            />
          )}
        </Field>

        <Field label="Payment method">
          <div className="flex gap-2">
            <ToggleButton active={paymentMethod === "CashOnDelivery"} onClick={() => setPaymentMethod("CashOnDelivery")}>
              Cash on delivery
            </ToggleButton>
            <ToggleButton active={paymentMethod === "BankTransfer"} onClick={() => setPaymentMethod("BankTransfer")}>
              Bank transfer
            </ToggleButton>
          </div>
        </Field>

        <Field label="Note (optional)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input min-h-16 resize-none"
            placeholder="Anything else we should know?"
          />
        </Field>

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-leaf py-3.5 text-base font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "Placing order…" : `Place order — ${formatMoney(total, currency)}`}
        </button>
      </form>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-bold text-forest">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full border-2 py-2.5 text-sm font-bold transition ${
        active ? "border-leaf bg-leaf/10 text-leaf-dark" : "border-gray-200 text-gray-500"
      }`}
    >
      {children}
    </button>
  )
}
