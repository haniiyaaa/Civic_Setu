import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import FilterBar from '../components/FilterBar.jsx'
import ReportTable from '../components/ReportTable.jsx'
import { fetchAllReports } from '../services/reportService'
import { getApiErrorMessage } from '../services/api'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    category: '',
    status: '',
    from: '',
    to: '',
  })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    fetchAllReports()
      .then((data) => mounted && setReports(data.reports || []))
      .catch((err) => mounted && setError(getApiErrorMessage(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const from = filters.from ? dayjs(filters.from) : null
    const to = filters.to ? dayjs(filters.to).endOf('day') : null

    return reports.filter((r) => {
      if (filters.category && r.category !== filters.category) return false
      if (filters.status && r.status !== filters.status) return false
      if (from && dayjs(r.createdAt).isBefore(from)) return false
      if (to && dayjs(r.createdAt).isAfter(to)) return false
      return true
    })
  }, [reports, filters])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">Reports</div>
          <div className="text-sm text-slate-500">
            View, filter, and manage all reported issues
          </div>
        </div>
        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filtered.length}</span>{' '}
          of <span className="font-semibold text-slate-900">{reports.length}</span>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({ category: '', status: '', from: '', to: '' })}
      />

      {loading ? (
        <div className="rounded-2xl bg-white shadow p-6 text-sm text-slate-600">
          Loading reports…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 shadow p-6 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <ReportTable reports={filtered} onView={(id) => navigate(`/reports/${id}`)} />
      )}
    </div>
  )
}

