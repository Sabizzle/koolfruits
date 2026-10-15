import { useEffect, useRef, useState } from "react"
import { resolveMediaUrl } from "../../api/client"
import { formatMoney } from "../../lib/format"
import type { AdminProduct } from "../../types"
import { adminApi } from "../api"
import { useAppData } from "../../context/AppDataContext"

function ProductRow({ product, currency, onChange }: { product: AdminProduct; currency: string; onChange: (p: AdminProduct) => void }) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description ?? "")
  const [price, setPrice] = useState(String(product.price))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const dirty = name !== product.name || description !== (product.description ?? "") || Number(price) !== product.price

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const updated = await adminApi.updateProduct(product.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
      })
      onChange(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleSoldOut() {
    try {
      const updated = await adminApi.updateProductSoldOut(product.id, !product.soldOut)
      onChange(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update sold-out status.")
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const updated = await adminApi.uploadProductPhoto(product.id, file)
      onChange(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload photo.")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-cream">
        {product.photoUrl && (
          <img src={resolveMediaUrl(product.photoUrl) ?? undefined} alt={name} className="h-full w-full object-cover" />
        )}
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-xs font-bold text-white"
        >
          {uploading ? "Uploading…" : "Change photo"}
        </button>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input flex-1" placeholder="Name" />
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">{currency}</span>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input w-28"
            />
          </div>
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
          placeholder="Description (optional)"
        />

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving}
            className="rounded-full bg-leaf px-4 py-1.5 text-sm font-bold text-white disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => void toggleSoldOut()}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              product.soldOut ? "bg-red-50 text-red-700" : "bg-leaf/10 text-leaf-dark"
            }`}
          >
            {product.soldOut ? "Sold out today — tap to restock" : "In stock — tap to mark sold out today"}
          </button>
          <span className="text-sm text-gray-400">{formatMoney(product.price, currency)} currently live</span>
        </div>
      </div>
    </div>
  )
}

export function Products() {
  const { config } = useAppData()
  const currency = config?.currency ?? "JMD"
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi
      .getAdminProducts()
      .then(setProducts)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load products."))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (updated: AdminProduct) =>
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))

  if (loading) return <p className="p-4 text-forest">Loading products…</p>
  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>

  return (
    <div>
      <h1 className="font-display mb-1 text-lg font-bold text-forest">Products</h1>
      <p className="mb-3 text-sm text-gray-500">
        "Sold out today" is a manual switch — remember to flip it back when you restock.
      </p>
      <div className="flex flex-col gap-3">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} currency={currency} onChange={handleChange} />
        ))}
      </div>
    </div>
  )
}
