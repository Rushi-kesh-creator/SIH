import { useEffect, useState } from 'react'
import { closeCompanyJob, createCompanyJob, getCompanyJobs, updateCompanyJob } from '../../api/companyApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import OpportunityForm from '../../components/OpportunityForm.jsx'

export default function IndustryManageJobs() {
  const [jobs, setJobs] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const load = () => getCompanyJobs().then(({ data }) => { setJobs(data || []); setStatus('ready') }).catch(() => setStatus('error'))
  useEffect(() => { load() }, [])
  const save = async (payload) => { setSaving(true); setError(''); try { if (form?.id) await updateCompanyJob(form.id, payload); else await createCompanyJob(payload); setForm(null); await load() } catch (requestError) { setError(requestError.response?.data?.detail || 'Could not save the job.') } finally { setSaving(false) } }
  const close = async (id) => { if (!window.confirm('Close this job?')) return; try { await closeCompanyJob(id); await load() } catch (requestError) { setError(requestError.response?.data?.detail || 'Could not close the job.') } }
  if (status === 'loading') return <Loading label="Loading jobs…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load your jobs. Please refresh the page." /></div>
  return <div><div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><h1 className="h4 font-display mb-1">Company Jobs</h1><p className="text-secondary mb-0">Manage jobs posted by your company.</p></div><button className="btn btn-aic-primary" onClick={() => setForm({ status: 'active' })}>Create Job</button></div>{form && <OpportunityForm type="job" initialValue={form.id ? form : null} saving={saving} onSave={save} onCancel={() => setForm(null)} />}{error && <div className="alert alert-danger small">{error}</div>}{jobs.length === 0 ? <div className="aic-card"><EmptyState description="No jobs posted yet." /></div> : <div className="d-flex flex-column gap-3">{jobs.map((job) => <div className="aic-card p-4" key={job.id}><div className="d-flex flex-wrap justify-content-between gap-3"><div><span className={`aic-badge ${job.status === 'closed' || job.status === 'inactive' ? 'aic-badge-danger' : 'aic-badge-success'} text-capitalize mb-2`}>{job.status}</span><h2 className="h6 mb-1">{job.title}</h2><p className="text-secondary small mb-2">{job.location} · {job.skills}</p><p className="small mb-0">{job.salary || 'Salary not specified'} · Created {new Date(job.created_at).toLocaleDateString()}</p></div><div className="d-flex align-items-start gap-2"><button className="btn btn-aic-outline btn-sm" onClick={() => setForm(job)}>Edit</button>{job.status !== 'closed' && <button className="btn btn-aic-outline btn-sm" onClick={() => close(job.id)}>Close</button>}</div></div></div>)}</div>}</div>
}
