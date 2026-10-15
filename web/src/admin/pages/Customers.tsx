import { useEffect, useState } from "react"
import { useAppData } from "../../context/AppDataContext"
import { formatMoney } from "../../lib/format"
import type { CustomerSummary } from "../../types"
import { adminApi } from "../api"
import { telHref, whatsAppHref } from "../lib/phone"

export function Customers() {
  const { config } = useAppData()
  const currency = config?.currency ?? "JMD"
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi
      .getCustomers()
      .then(setCustomers)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load customers."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-4 text-forest">Loading customers…</p>
  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>

  return (
    <div>
      <h1 className="font-display mb-3 text-lg font-bold text-forest">
        Customers <span className="text-sm font-normal text-gray-500">({customers.length})</span>
      </h1>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 text-xs uppercase text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Addresses</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Total spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-forest">{c.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <a href={telHref(c.phone)} className="font-medium text-forest underline">
                      {c.phone}
                    </a>
                    <a
                      href={whatsAppHref(c.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[#25D366]/10 px-2 py-0.5 text-xs font-bold text-[#128C7E]"
                    >
                      WhatsApp
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {c.addresses.map((a) => (
                    <div key={a}>{a}</div>
                  ))}
                </td>
                <td className="px-4 py-3 text-right">{c.orderCount}</td>
                <td className="px-4 py-3 text-right font-bold text-forest">{formatMoney(c.totalSpent, currency)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
