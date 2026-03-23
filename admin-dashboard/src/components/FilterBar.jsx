import dayjs from 'dayjs'
import { REPORT_CATEGORIES, REPORT_STATUSES } from '../utils/constants'

export default function FilterBar({ filters, onChange, onReset }) {
  return (
    <div className="rounded-2xl bg-white shadow p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <div className="text-xs font-medium text-slate-600">Category</div>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {REPORT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-600">Status</div>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-600">From</div>
          <input
            type="date"
            value={filters.from}
            max={dayjs().format('YYYY-MM-DD')}
            onChange={(e) => onChange({ ...filters, from: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <div className="text-xs font-medium text-slate-600">To</div>
          <input
            type="date"
            value={filters.to}
            max={dayjs().format('YYYY-MM-DD')}
            onChange={(e) => onChange({ ...filters, to: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Tip: combine filters to narrow results
        </div>
        <button
          onClick={onReset}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

