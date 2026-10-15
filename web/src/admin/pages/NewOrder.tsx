import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ApiError } from "../../api/client"
import { useAppData } from "../../context/AppDataContext"
import { formatMoney } from "../../lib/format"
import type { CreateOrderRequest, PaymentMethod } from "../../types"
import { adminApi } from "../api"
import { useAdminOrders } from "../context/AdminOrdersContext"

export function NewOrder() {
  const { products, areas, config } = useAppData()
  const { refresh } = useAdminOrders()
  const navigate = useNavigate()
  const currency = config?.currency ?? "JMD"

  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAreaId, setDeliveryAreaId] = useState<number | "">("")
  const [streetAddress, setStreetAddress] = useState("")
  const [landmarkDirections, setLandmarkDirections] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CashOnDelivery")
  const [isPaidAlready, setIsPaidAlready] = useState(false)
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setQty = (productId: number, qty: number) =>
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, qty) }))

  const lines = products
    .map((p) => ({ product: p, quantity: quantities[p.id] ?? 0 }))
    .filter((l) => l.quantity > 0)

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0)
  const selectedArea = areas.find((a) => a.id === deliveryAreaId)
  const total = subtotal + (selectedArea?.deliveryFee ?? 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (lines.length === 0) {
      setError("Add at least one item.")
      return
    }
    if (deliveryAreaId === "") {
      setError("Choose a delivery area.")
      return
    }

    const payload: CreateOrderRequest = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAreaId,
      streetAddress: streetAddress.trim(),
      landmarkDirections: landmarkDirections.trim() || undefined,
      preferredTime: "Asap",
      paymentMethod,
      note: note.trim() || undefined,
      items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
    }

    setSubmitting(true)
    try {
      const order = await adminApi.createOrder(payload)
      if (isPaidAlready) {
        await adminApi.updatePaid(order.id, true)
      }
      await refresh({ silent: true })
      navigate("/admin")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display mb-4 text-lg font-bold text-forest">New manual order</h1>
      <p className="mb-4 text-sm text-gray-500">For customers who called or messaged you directly.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-forest">Items</h2>
          <div className="flex flex-col gap-2">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-forest">{product.name}</p>
                  <p className="text-xs text-gray-500">{formatMoney(product.price, currency)}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  disabled={product.soldOut}
                  value={quantities[product.id] ?? 0}
                  onChange={(e) => setQty(product.id, Number(e.target.value))}
                  className="input w-20 text-center disabled:bg-gray-100"
                />
              </div>
            ))}
          </div>
        </div>

        <Field label="Customer name">
          <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input" />
        </Field>

        <Field label="Phone number">
          <input
            required
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="input"
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
              Choose area
            </option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} {a.deliveryFee > 0 ? `(+${formatMoney(a.deliveryFee, currency)})` : "(free)"}
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
          />
        </Field>

        <Field label="Landmark / directions">
          <input
            value={landmarkDirections}
            onChange={(e) => setLandmarkDirections(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Payment method">
          <div className="flex gap-2">
            {(["CashOnDelivery", "BankTransfer"] as const).map((pm) => (
              <button
                key={pm}
                type="button"
                onClick={() => setPaymentMethod(pm)}
                className={`flex-1 rounded-full border-2 py-2 text-sm font-bold transition ${
                  paymentMethod === pm ? "border-leaf bg-leaf/10 text-leaf-dark" : "border-gray-200 text-gray-500"
                }`}
              >
                {pm === "CashOnDelivery" ? "Cash on delivery" : "Bank transfer"}
              </button>
            ))}
          </div>
        </Field>

        <label className="flex items-center gap-2 text-sm font-medium text-forest">
          <input
            type="checkbox"
            checked={isPaidAlready}
            onChange={(e) => setIsPaidAlready(e.target.checked)}
            className="h-4 w-4"
          />
          Already paid
        </label>

        <Field label="Note (optional)">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="input min-h-16 resize-none" />
        </Field>

        <div className="flex justify-between rounded-2xl bg-white p-4 text-sm shadow-sm">
          <span className="font-bold text-forest">Total</span>
          <span className="font-display text-lg font-bold text-forest">{formatMoney(total, currency)}</span>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-leaf py-3.5 text-base font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create order"}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-bold text-forest">{label}</span>
      {children}
    </label>
  )
}
