import { api } from './api'

export async function adminLogin({ email, password }) {
  const { data } = await api.post('/auth/admin/signin', { email, password })
  return data
}

export async function requestAdminOtp({ email, adminKey }) {
  const { data } = await api.post('/auth/admin/generateOtp', { email, adminKey })
  return data
}

export async function verifyAdminOtp({
  name,
  email,
  phone,
  address,
  password,
  otp,
}) {
  const { data } = await api.post('/auth/admin/verifyAdminOtp', {
    name,
    email,
    phone,
    address,
    password,
    otp,
  })
  return data
}

export async function requestPasswordResetOtp({ email }) {
  const { data } = await api.post('/auth/forgotPass/reqOtp', { email })
  return data
}

export async function verifyPasswordResetOtp({ email, otp, newPassword }) {
  const { data } = await api.post('/auth/forgotPass/verifyOtp', {
    email,
    otp,
    newPassword,
  })
  return data
}

