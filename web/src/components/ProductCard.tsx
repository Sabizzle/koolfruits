import { resolveMediaUrl } from "../api/client"
import { useAppData } from "../context/AppDataContext"
import { useCart } from "../context/CartContext"
import { formatMoney } from "../lib/format"
import type { Product } from "../types"
import { QuantityStepper } from "./QuantityStepper"

export function ProductCard({ product }: { product: Product }) {
  const { config } = useAppData()
  const { quantityOf, increment, decrement } = useCart()
  const quantity = quantityOf(product.id)
  const currency = config?.currency ?? "JMD"

  return (
    <div
      className={`flex gap-3 rounded-2xl bg-white p-3 shadow-sm ${product.soldOut ? "opacity-60 grayscale" : ""}`}
    >
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream">
        {product.photoUrl && (
          <img src={resolveMediaUrl(product.photoUrl) ?? undefined} alt={product.name} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="font-display text-base font-semibold text-forest">{product.name}</h3>
          <p className="text-lg font-bold text-leaf-dark">{formatMoney(product.price, currency)}</p>
        </div>

        {product.soldOut ? (
          <span className="w-fit rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-600">
            Sold out
          </span>
        ) : (
          <div className="w-32">
            <QuantityStepper
              quantity={quantity}
              onIncrement={() => increment(product)}
              onDecrement={() => decrement(product)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
