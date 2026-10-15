import { CartBar } from "../components/CartBar"
import { Header } from "../components/Header"
import { ProductCard } from "../components/ProductCard"
import { useAppData } from "../context/AppDataContext"
import { useCart } from "../context/CartContext"

export function Home() {
  const { products, loading, error, retry } = useAppData()
  const { itemCount } = useCart()

  return (
    <div className={itemCount > 0 ? "pb-24" : "pb-6"}>
      <Header />

      <main className="mx-auto flex max-w-md flex-col gap-3 px-4">
        {!loading && !error && products.length > 0 && (
          <p className="-mt-1 mb-1 text-center text-sm text-gray-500">
            Pick your coconut water below 🥥
          </p>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center">
            <p className="text-sm text-forest">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-leaf px-5 py-2 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && products.map((product) => <ProductCard key={product.id} product={product} />)}
      </main>

      <CartBar />
    </div>
  )
}
