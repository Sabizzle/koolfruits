import { useEffect, useState } from "react"
import { useAppData } from "../../context/AppDataContext"
import type { AdminDeliveryArea } from "../../types"
import { adminApi } from "../api"

function AreaRow({ area, currency, onChange }: { area: AdminDeliveryArea; currency: string; onChange: (a: AdminDeliveryArea) => void }) {
  const [name, setName] = useState(area.name)
  const [fee, setFee] = useState(String(area.deliveryFee))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = name !== area.name || Number(fee) !== area.deliveryFee

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const updated = await adminApi.updateArea(area.id, { name: name.trim(), deliveryFee: Number(fee), isActive: area.isActive })
      onChange(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive() {
    try {
      const updated = await adminApi.updateArea(area.id, { name: area.name, deliveryFee: area.deliveryFee, isActive: !area.isActive })
      onChange(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update area.")
    }
  }

  return (
    <div className={`flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center ${!area.isActive ? "opacity-60" : ""}`}>
      <input value={name} onChange={(e) => setName(e.target.value)} className="input flex-1" placeholder="Area name" />
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500">{currency}</span>
        <input type="number" min={0} value={fee} onChange={(e) => setFee(e.target.value)} className="input w-28" />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
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
          onClick={() => void toggleActive()}
          className={`rounded-full px-4 py-1.5 text-sm font-bold ${
            area.isActive ? "bg-red-50 text-red-700" : "bg-leaf/10 text-leaf-dark"
          }`}
        >
          {area.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  )
}

export function Areas() {
  const { config } = useAppData()
  const currency = config?.currency ?? "JMD"
  const [areas, setAreas] = useState<AdminDeliveryArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState("")
  const [newFee, setNewFee] = useState("0")
  const [creating, setCreating] = useState(false)

  const load = () =>
    adminApi
      .getAdminAreas()
      .then(setAreas)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load delivery areas."))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const handleChange = (updated: AdminDeliveryArea) =>
    setAreas((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))

  async function addArea() {
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const created = await adminApi.createArea({ name: newName.trim(), deliveryFee: Number(newFee), isActive: true })
      setAreas((prev) => [...prev, created])
      setNewName("")
      setNewFee("0")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add area.")
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <p className="p-4 text-forest">Loading delivery areas…</p>

  return (
    <div>
      <h1 className="font-display mb-3 text-lg font-bold text-forest">Delivery areas</h1>

      {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-4 flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="input flex-1"
          placeholder="New area name"
        />
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">{currency}</span>
          <input type="number" min={0} value={newFee} onChange={(e) => setNewFee(e.target.value)} className="input w-28" />
        </div>
        <button
          type="button"
          onClick={() => void addArea()}
          disabled={!newName.trim() || creating}
          className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          {creating ? "Adding…" : "+ Add area"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {areas.map((a) => (
          <AreaRow key={a.id} area={a} currency={currency} onChange={handleChange} />
        ))}
      </div>
    </div>
  )
}
