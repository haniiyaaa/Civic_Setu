import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import dayjs from 'dayjs'
import { fetchAllReports } from '../services/reportService'
import { getApiErrorMessage } from '../services/api'
import { REPORT_CATEGORIES } from '../utils/constants'

function monthKey(d) {
  return dayjs(d).format('MMM YY')
}

export default function Dashboard() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    fetchAllReports()
      .then((data) => {
        if (!mounted) return
        setReports(data.reports || [])
      })
      .catch((err) => {
        if (!mounted) return
        setError(getApiErrorMessage(err))
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const unresolvedCount = useMemo(() => {
    return reports.filter((r) => r.status !== 'Resolved').length
  }, [reports])

  const pieColors = ['#f59e0b', '#3b82f6', '#10b981']

  const pieData = useMemo(() => {
    const counts = { Pending: 0, 'In Progress': 0, Resolved: 0 }
    for (const r of reports) counts[r.status] = (counts[r.status] || 0) + 1
    return [
      { name: 'Pending', value: counts.Pending },
      { name: 'In Progress', value: counts['In Progress'] },
      { name: 'Resolved', value: counts.Resolved },
    ]
  }, [reports])

  const barData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) months.push(dayjs().subtract(i, 'month'))
    const keys = months.map((m) => monthKey(m))

    const byMonth = new Map(keys.map((k) => [k, { month: k }]))
    for (const r of reports) {
      const k = monthKey(r.createdAt)
      if (!byMonth.has(k)) continue
      const row = byMonth.get(k)
      row[r.category] = (row[r.category] || 0) + 1
    }

    // ensure all categories exist for stable legend
    return keys.map((k) => {
      const row = byMonth.get(k)
      for (const c of REPORT_CATEGORIES) row[c] = row[c] || 0
      return row
    })
  }, [reports])



  const categoryColors = [
    '#0f172a',
    '#334155',
    '#475569',
    '#64748b',
    '#94a3b8',
    '#a78bfa',
    '#f59e0b',
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white shadow p-6 lg:col-span-1">
          <div className="text-sm font-medium text-slate-600">
            Total Unresolved Reports
          </div>
          <div className="mt-3 text-5xl font-semibold tracking-tight text-slate-900">
            {loading ? '—' : unresolvedCount}
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Pending + In Progress
          </div>
          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Status Distribution
              </div>
              <div className="text-xs text-slate-500">All reports</div>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow p-6">
        <div className="text-sm font-semibold text-slate-900">
          Reports per Month by Category
        </div>
        <div className="text-xs text-slate-500">
          Last 6 months • grouped by category
        </div>

        <div className="mt-4 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              {REPORT_CATEGORIES.map((c, idx) => (
                <Bar
                  key={c}
                  dataKey={c}
                  fill={categoryColors[idx % categoryColors.length]}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={26}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

