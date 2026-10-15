import { useEffect, useState } from "react"
import { useAppData } from "../../context/AppDataContext"
import { formatMoney } from "../../lib/format"
import type { SalesPeriod, SalesSummary as SalesSummaryType } from "../../types"
import { adminApi } from "../api"

function PeriodCard({ title, period, currency }: { title: string; period: SalesPeriod; currency: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-display text-base font-bold text-forest">{title}</h2>

      <div className="flex gap-4">
        <div>
          <p className="text-2xl font-bold text-leaf-dark">{formatMoney(period.revenue, currency)}</p>
          <p className="text-xs text-gray-500">revenue</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-forest">{period.orderCount}</p>
          <p className="text-xs text-gray-500">orders</p>
        </div>
      </div>

      <div className="border-t border-black/5 pt-2">
        <p className="mb-1 text-xs font-bold uppercase text-gray-400">Quantity sold</p>
        {period.items.length === 0 ? (
          <p className="text-sm text-gray-400">No sales yet.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {period.items.map((item) => (
              <li key={item.productName} className="flex justify-between">
                <span>{item.productName}</span>
                <span className="font-bold text-forest">{item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function Sales() {
  const { config } = useAppData()
  const currency = config?.currency ?? "JMD"
  const [summary, setSummary] = useState<SalesSummaryType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi
      .getSalesSummary()
      .then(setSummary)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load sales summary."))
  }, [])

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
  if (!summary) return <p className="p-4 text-forest">Loading sales summary…</p>

  return (
    <div>
      <h1 className="font-display mb-3 text-lg font-bold text-forest">Sales summary</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PeriodCard title="Today" period={summary.today} currency={currency} />
        <PeriodCard title="This week" period={summary.thisWeek} currency={currency} />
        <PeriodCard title="This month" period={summary.thisMonth} currency={currency} />
      </div>
    </div>
  )
}
