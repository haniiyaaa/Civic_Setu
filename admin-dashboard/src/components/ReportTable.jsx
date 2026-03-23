import dayjs from 'dayjs'
import StatusBadge from './StatusBadge.jsx'

export default function ReportTable({ reports, onView }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((r) => (
              <tr key={r._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {r.description?.slice(0, 32) || 'Report'}…
                </td>
                <td className="px-4 py-3 text-slate-700">{r.category}</td>
                <td className="px-4 py-3 text-slate-700">{r.address || '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {dayjs(r.createdAt).format('DD MMM YYYY')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onView(r._id)}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={6}>
                  No reports found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

