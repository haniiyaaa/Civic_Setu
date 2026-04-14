import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import StatusBadge from '../components/StatusBadge.jsx'
import {
  deleteReport as apiDeleteReport,
  fetchReportDetails,
  updateReportStatus,
} from '../services/reportService'
import { getApiErrorMessage } from '../services/api'

function nextStatus(current) {
  if (current === 'Pending') return 'In Progress'
  if (current === 'In Progress') return 'Resolved'
  return 'Resolved'
}

export default function ReportDetails() {
  const { reportId } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const [resolutionDescription, setResolutionDescription] = useState('')
  const [proofFile, setProofFile] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    fetchReportDetails(reportId)
      .then((data) => mounted && setReport(data.report))
      .catch((err) => mounted && setError(getApiErrorMessage(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [reportId])

  const position = useMemo(() => {
    const coords = report?.location?.coordinates
    if (!coords || coords.length !== 2) return null
    const [lng, lat] = coords
    return [lat, lng]
  }, [report])

  async function onUpdateStatus() {
    if (!report) return
    setError('')
    setActionLoading(true)
    try {
      const target = nextStatus(report.status)
      const data = await updateReportStatus({
        reportId: report._id,
        status: target,
        resolutionDescription: target === 'Resolved' ? resolutionDescription : '',
        proofFile: target === 'Resolved' ? proofFile : null,
      })
      setReport(data.report)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  async function onReject() {
    if (!report) return
    const ok = window.confirm(
      'Rejecting will delete this report from the system. Continue?'
    )
    if (!ok) return
    setError('')
    setActionLoading(true)
    try {
      await apiDeleteReport(report._id)
      navigate('/reports', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow p-6 text-sm text-slate-600">
          Loading report…
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow p-6">
          <div className="text-lg font-semibold text-slate-900">
            Report not found
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Report Details</div>
            <div className="text-xl font-semibold text-slate-900">
              {report.category}
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 shadow p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-white shadow p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Details</div>
              <StatusBadge status={report.status} />
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-xs font-medium text-slate-500">Description</div>
                <div className="mt-1 text-slate-900">{report.description}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-medium text-slate-500">Address</div>
                  <div className="mt-1 text-slate-900">{report.address || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Created</div>
                  <div className="mt-1 text-slate-900">
                    {dayjs(report.createdAt).format('DD MMM YYYY, hh:mm A')}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-500">Uploaded media</div>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {(report.media || []).length === 0 ? (
                    <div className="text-slate-500">No media uploaded.</div>
                  ) : (
                    report.media.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-xl border border-slate-200"
                      >
                        <img
                          src={url}
                          alt="Report media"
                          className="h-40 w-full object-cover transition group-hover:scale-[1.02]"
                        />
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow p-6">
            <div className="text-sm font-semibold text-slate-900">Citizen</div>
            <div className="mt-3 space-y-2 text-sm">
              <div>
                <div className="text-xs text-slate-500">Name</div>
                <div className="font-medium text-slate-900">
                  {report.userId?.name || '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Email</div>
                <div className="text-slate-900">{report.userId?.email || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Phone</div>
                <div className="text-slate-900">{report.userId?.phone || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Address</div>
                <div className="text-slate-900">{report.userId?.address || '—'}</div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <div className="text-sm font-semibold text-slate-900">Actions</div>

              {report.status === 'In Progress' && (
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-slate-600">
                      Resolution proof image
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="mt-1 w-full text-sm"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-600">
                      Resolution description
                    </div>
                    <textarea
                      value={resolutionDescription}
                      onChange={(e) => setResolutionDescription(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="What was done to resolve this issue?"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <button
                  disabled={actionLoading}
                  onClick={onUpdateStatus}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {actionLoading
                    ? 'Updating…'
                    : `Update Status → ${nextStatus(report.status)}`}
                </button>
                <button
                  disabled={actionLoading}
                  onClick={onReject}
                  className="w-full rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                >
                  Reject Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="text-sm font-semibold text-slate-900">
              Location Preview
            </div>
          </div>
          <div className="h-80">
            {position ? (
              <MapContainer center={position} zoom={15} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position} />
              </MapContainer>
            ) : (
              <div className="h-full grid place-items-center text-sm text-slate-600">
                Location not available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

