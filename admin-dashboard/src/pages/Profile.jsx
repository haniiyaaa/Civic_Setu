import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getApiErrorMessage } from '../services/api'
import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
} from '../services/authService'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [email] = useState(user?.email || '')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function onRequestOtp() {
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const data = await requestPasswordResetOtp({ email })
      setMessage(data.message || 'OTP sent to your email.')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function onChangePassword(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const data = await verifyPasswordResetOtp({ email, otp, newPassword })
      setMessage(data.message || 'Password updated.')
      setOtp('')
      setNewPassword('')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow p-6">
        <div className="text-lg font-semibold text-slate-900">Profile</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-slate-500">Admin Name</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {user?.name || '—'}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Email</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {user?.email || '—'}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow p-6">
        <div className="text-lg font-semibold text-slate-900">Change Password</div>
        <div className="mt-1 text-sm text-slate-600">
          Uses the backend OTP reset flow.
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            disabled={loading}
            onClick={onRequestOtp}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send OTP to Email'}
          </button>
          <div className="text-sm text-slate-600">{email}</div>
        </div>

        <form onSubmit={onChangePassword} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-slate-600">OTP</div>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="6-digit OTP"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600">New Password</div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Min 6 chars"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              disabled={loading}
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
            <Link to="/dashboard" className="text-sm font-semibold text-slate-900">
              Back to Dashboard
            </Link>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

