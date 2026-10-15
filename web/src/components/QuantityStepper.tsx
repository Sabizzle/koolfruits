interface Props {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  disabled?: boolean
}

export function QuantityStepper({ quantity, onIncrement, onDecrement, disabled }: Props) {
  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        className="w-full rounded-full bg-leaf py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Add to cart
      </button>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-full bg-leaf/10 p-1">
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-bold text-leaf-dark shadow-sm transition active:scale-90"
      >
        &minus;
      </button>
      <span className="min-w-8 text-center text-base font-bold text-forest">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf text-xl font-bold text-white shadow-sm transition active:scale-90"
      >
        +
      </button>
    </div>
  )
}
