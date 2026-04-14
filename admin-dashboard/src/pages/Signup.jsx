import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../services/api'
import { requestAdminOtp, verifyAdminOtp } from '../services/authService'

export default function Signup() {
  const [step, setStep] = useState(1) // 1=request OTP, 2=verify OTP + create
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [otp, setOtp] = useState('')

  const navigate = useNavigate()

  const canRequestOtp = useMemo(() => {
    return email.trim() && adminKey.trim().length >= 6
  }, [email, adminKey])

  const canVerify = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      email.trim() &&
      phone.trim().length >= 10 &&
      address.trim().length >= 10 &&
      password.trim().length >= 6 &&
      otp.trim().length === 6
    )
  }, [name, email, phone, address, password, otp])

  async function onRequestOtp(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!canRequestOtp) return
    setLoading(true)
    try {
      const data = await requestAdminOtp({ email, adminKey })
      setSuccess(data.message || 'OTP sent to your email.')
      setStep(2)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function onVerify(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!canVerify) return
    setLoading(true)
    try {
      const data = await verifyAdminOtp({
        name,
        email,
        phone,
        address,
        password,
        otp,
      })
      setSuccess(data.message || 'Admin account created.')
      setTimeout(() => navigate('/login', { replace: true }), 600)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow p-6">
        <div className="text-2xl font-semibold text-slate-900">
          Create Admin Account
        </div>
        <div className="mt-1 text-sm text-slate-600">
          Admin signup uses a secret key + email OTP (as required by the backend).
        </div>

        {step === 1 ? (
          <form onSubmit={onRequestOtp} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Admin Secret Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Enter admin key"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !canRequestOtp}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-600">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Admin Name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="10+ digits"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">OTP</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tracking-widest"
                  placeholder="6-digit OTP"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Full address (min 10 chars)"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Min 6 chars"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setError('')
                  setSuccess('')
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !canVerify}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? 'Creating…' : 'Create Admin Account'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

