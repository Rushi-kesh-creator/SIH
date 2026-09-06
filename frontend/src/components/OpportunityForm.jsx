import { useEffect, useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active / Published' },
  { value: 'closed', label: 'Closed' },
]

export default function OpportunityForm({ type, initialValue, saving, onSave, onCancel }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    setForm(initialValue || { status: 'active' })
  }, [initialValue])

  const handleChange = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const isInternship = type === 'internship'

  return (
    <form className="aic-card p-4 mb-4" onSubmit={(event) => { event.preventDefault(); onSave(form) }}>
      <h2 className="h6 mb-3">{initialValue ? `Edit ${isInternship ? 'Internship' : 'Job'}` : `Create ${isInternship ? 'Internship' : 'Job'}`}</h2>
      <div className="row g-3">
        <div className="col-md-6"><label className="form-label small fw-semibold" htmlFor="opportunity-title">Title</label><input id="opportunity-title" className="form-control" required value={form.title || ''} onChange={(event) => handleChange('title', event.target.value)} /></div>
        <div className="col-md-6"><label className="form-label small fw-semibold" htmlFor="opportunity-location">Location</label><input id="opportunity-location" className="form-control" required value={form.location || ''} onChange={(event) => handleChange('location', event.target.value)} /></div>
        <div className="col-12"><label className="form-label small fw-semibold" htmlFor="opportunity-description">Description</label><textarea id="opportunity-description" className="form-control" rows={4} required value={form.description || ''} onChange={(event) => handleChange('description', event.target.value)} /></div>
        <div className="col-md-6"><label className="form-label small fw-semibold" htmlFor="opportunity-skills">Skills</label><input id="opportunity-skills" className="form-control" required value={form.skills || ''} onChange={(event) => handleChange('skills', event.target.value)} /></div>
        <div className="col-md-6"><label className="form-label small fw-semibold" htmlFor="opportunity-status">Status</label><select id="opportunity-status" className="form-select" value={form.status || 'active'} onChange={(event) => handleChange('status', event.target.value)}>{STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
        {isInternship ? <><div className="col-md-6"><label className="form-label small fw-semibold" htmlFor="opportunity-duration">Duration</label><input id="opportunity-duration" className="form-control" value={form.duration || ''} onChange={(event) => handleChange('duration', event.target.value)} /></div><div className="col-md-6"><label className="form-label small fw-semibold" htmlFor="opportunity-stipend">Stipend</label><input id="opportunity-stipend" className="form-control" value={form.stipend || ''} onChange={(event) => handleChange('stipend', event.target.value)} /></div></> : <div className="col-md-6"><label className="form-label small fw-semibold" htmlFor="opportunity-salary">Salary</label><input id="opportunity-salary" className="form-control" value={form.salary || ''} onChange={(event) => handleChange('salary', event.target.value)} /></div>}
      </div>
      <div className="d-flex gap-2 mt-4"><button type="submit" className="btn btn-aic-primary" disabled={saving}>{saving ? 'Saving…' : initialValue ? 'Save Changes' : 'Create'}</button>{onCancel && <button type="button" className="btn btn-aic-outline" onClick={onCancel} disabled={saving}>Cancel</button>}</div>
    </form>
  )
}