import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet.heat'
import dayjs from 'dayjs'
import { fetchAllReports } from '../services/reportService'
import { getApiErrorMessage } from '../services/api'

// Fix default marker icons for Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function HeatLayer({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return
    const layer = L.heatLayer(points, {
      radius: 25,
      blur: 18,
      maxZoom: 17,
    })
    layer.addTo(map)
    return () => {
      layer.remove()
    }
  }, [map, points])

  return null
}

export default function MapView() {
  const [mode, setMode] = useState('normal') // normal | heat
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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

  const center = useMemo(() => {
    const first = reports.find((r) => r?.location?.coordinates?.length === 2)
    if (!first) return [19.076, 72.8777] // fallback: Mumbai
    const [lng, lat] = first.location.coordinates
    return [lat, lng]
  }, [reports])

  const visibleMarkers = useMemo(() => {
    return reports.filter((r) => r.status === 'Pending' || r.status === 'In Progress')
  }, [reports])

  const heatPoints = useMemo(() => {
    return reports
      .filter((r) => r?.location?.coordinates?.length === 2)
      .map((r) => {
        const [lng, lat] = r.location.coordinates
        return [lat, lng, 0.6]
      })
  }, [reports])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-900">Map View</div>
          <div className="text-sm text-slate-500">
            Normal mode shows only Pending/In Progress markers
          </div>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            onClick={() => setMode('normal')}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              mode === 'normal' ? 'bg-slate-900 text-white' : 'text-slate-700'
            }`}
          >
            Normal Map
          </button>
          <button
            onClick={() => setMode('heat')}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              mode === 'heat' ? 'bg-slate-900 text-white' : 'text-slate-700'
            }`}
          >
            Heat Map
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white shadow p-6 text-sm text-slate-600">
          Loading map…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 shadow p-6 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="h-[70vh] w-full">
            <MapContainer center={center} zoom={12} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mode === 'heat' ? (
                <HeatLayer points={heatPoints} />
              ) : (
                visibleMarkers.map((r) => {
                  const [lng, lat] = r.location.coordinates
                  return (
                    <Marker key={r._id} position={[lat, lng]}>
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{r.category}</div>
                          <div className="text-slate-600">
                            {dayjs(r.createdAt).format('DD MMM YYYY')}
                          </div>
                          <button
                            className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                            onClick={() => navigate(`/reports/${r._id}`)}
                          >
                            Open Details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })
              )}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  )
}

