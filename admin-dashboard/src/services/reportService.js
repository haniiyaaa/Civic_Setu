import { api } from './api'

export async function fetchAllReports() {
  const { data } = await api.get('/report/admin/reports')
  return data
}

export async function fetchReportDetails(reportId) {
  const { data } = await api.get(`/report/admin/getReportDetails/${reportId}`)
  return data
}

export async function deleteReport(reportId) {
  const { data } = await api.delete(`/report/admin/deleteReport/${reportId}`)
  return data
}

export async function updateReportStatus({
  reportId,
  status,
  resolutionDescription,
  proofFile,
}) {
  const form = new FormData()
  form.append('status', status)
  if (resolutionDescription) form.append('resolutionDescription', resolutionDescription)
  if (proofFile) form.append('proof', proofFile)

  const { data } = await api.patch(`/report/admin/updateStatus/${reportId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

