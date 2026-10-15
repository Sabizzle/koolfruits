import { useNavigate } from "react-router-dom"
import { useAppData } from "../context/AppDataContext"
import { useCart } from "../context/CartContext"
import { formatMoney } from "../lib/format"

export function CartBar() {
  const { itemCount, subtotal } = useCart()
  const { config } = useAppData()
  const navigate = useNavigate()

  if (itemCount === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur">
      <button
        type="button"
        onClick={() => navigate("/checkout")}
        className="mx-auto flex w-full max-w-md items-center justify-between rounded-full bg-forest px-5 py-3.5 text-white shadow-md transition active:scale-[0.98]"
      >
        <span className="flex items-center gap-2 font-bold">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pineapple text-sm text-forest">
            {itemCount}
          </span>
          View cart
        </span>
        <span className="font-display text-lg font-bold">{formatMoney(subtotal, config?.currency ?? "JMD")}</span>
      </button>
    </div>
  )
}
