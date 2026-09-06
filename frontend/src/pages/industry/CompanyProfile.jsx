import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getCompanyProfile, updateCompanyProfile } from '../../api/companyApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

export default function IndustryCompanyProfile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getCompanyProfile()
      .then(({ data }) => {
        setProfile(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const { data } = await updateCompanyProfile({
        website: profile.website,
        location: profile.location,
        description: profile.description,
      })
      setProfile(data)
      setEditing(false)
      toast.success('Company profile updated.')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not save company profile.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') return <Loading label="Loading company profile…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load your company profile. Please refresh the page." /></div>

  return (
    <div>
      <h1 className="h4 font-display mb-1">Company Profile</h1>
      <p className="text-secondary mb-4">Manage the company information used across your industry portal.</p>
      <form onSubmit={handleSave} className="aic-card p-4" style={{ maxWidth: 640 }}>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="company-name">Company Name</label>
          <input id="company-name" className="form-control" value={profile.name || ''} disabled />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="company-email">Email</label>
          <input id="company-email" type="email" className="form-control" value={profile.email || ''} disabled />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="company-website">Website</label>
          <input id="company-website" type="url" className="form-control" value={profile.website || ''} disabled={!editing} onChange={(event) => setProfile({ ...profile, website: event.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="company-location">Location</label>
          <input id="company-location" className="form-control" value={profile.location || ''} disabled={!editing} onChange={(event) => setProfile({ ...profile, location: event.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="company-description">Description</label>
          <textarea id="company-description" className="form-control" rows={5} value={profile.description || ''} disabled={!editing} onChange={(event) => setProfile({ ...profile, description: event.target.value })} />
        </div>
        {editing ? (
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-aic-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            <button type="button" className="btn btn-aic-outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
          </div>
        ) : <button type="button" className="btn btn-aic-primary" onClick={() => setEditing(true)}>Edit Profile</button>}
      </form>
    </div>
  )
}
