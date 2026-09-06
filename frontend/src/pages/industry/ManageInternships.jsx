import { useEffect, useState } from 'react'
import { closeCompanyInternship, createCompanyInternship, getCompanyInternships, updateCompanyInternship } from '../../api/companyApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import OpportunityForm from '../../components/OpportunityForm.jsx'

export default function IndustryManageInternships() {
  const [internships, setInternships] = useState([])
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const load = () => getCompanyInternships().then(({ data }) => { setInternships(data || []); setStatus('ready') }).catch(() => setStatus('error'))
  useEffect(() => { load() }, [])
  const save = async (payload) => { setSaving(true); setError(''); try { if (form?.id) await updateCompanyInternship(form.id, payload); else await createCompanyInternship(payload); setForm(null); await load() } catch (requestError) { setError(requestError.response?.data?.detail || 'Could not save the internship.') } finally { setSaving(false) } }
  const close = async (id) => { if (!window.confirm('Close this internship?')) return; try { await closeCompanyInternship(id); await load() } catch (requestError) { setError(requestError.response?.data?.detail || 'Could not close the internship.') } }
  if (status === 'loading') return <Loading label="Loading internships…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load your internships. Please refresh the page." /></div>
  return <div><div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><h1 className="h4 font-display mb-1">Company Internships</h1><p className="text-secondary mb-0">Manage internships posted by your company.</p></div><button className="btn btn-aic-primary" onClick={() => setForm({ status: 'active' })}>Create Internship</button></div>{form && <OpportunityForm type="internship" initialValue={form.id ? form : null} saving={saving} onSave={save} onCancel={() => setForm(null)} />}{error && <div className="alert alert-danger small">{error}</div>}{internships.length === 0 ? <div className="aic-card"><EmptyState description="No internships posted yet." /></div> : <div className="d-flex flex-column gap-3">{internships.map((internship) => <div className="aic-card p-4" key={internship.id}><div className="d-flex flex-wrap justify-content-between gap-3"><div><span className={`aic-badge ${internship.status === 'closed' || internship.status === 'inactive' ? 'aic-badge-danger' : 'aic-badge-success'} text-capitalize mb-2`}>{internship.status}</span><h2 className="h6 mb-1">{internship.title}</h2><p className="text-secondary small mb-2">{internship.location} · {internship.skills}</p><p className="small mb-0">{internship.duration || 'Duration not specified'}{internship.stipend ? ` · ${internship.stipend}` : ''} · Created {new Date(internship.created_at).toLocaleDateString()}</p></div><div className="d-flex align-items-start gap-2"><button className="btn btn-aic-outline btn-sm" onClick={() => setForm(internship)}>Edit</button>{internship.status !== 'closed' && <button className="btn btn-aic-outline btn-sm" onClick={() => close(internship.id)}>Close</button>}</div></div></div>)}</div>}</div>
}
