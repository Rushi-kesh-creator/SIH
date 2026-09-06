import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getAcademicianProfile, updateAcademicianProfile } from '../../api/academicianApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

export default function AcademicianProfile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getAcademicianProfile()
      .then(({ data }) => { setProfile(data); setStatus('ready') })
      .catch(() => setStatus('error'))
  }, [])

  const save = async (event) => {
    event.preventDefault()
    if (!profile.name?.trim()) { toast.error('Name is required.'); return }
    setSaving(true)
    try {
      const { data } = await updateAcademicianProfile({ name: profile.name.trim() })
      setProfile(data)
      setEditing(false)
      toast.success('Profile updated.')
    } catch (error) { toast.error(error.response?.data?.detail || 'Could not save your profile.') } finally { setSaving(false) }
  }

  if (status === 'loading') return <Loading label="Loading academician profile…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load your profile. Please refresh the page." /></div>

  return <div><h1 className="h4 font-display mb-1">Academician Profile</h1><p className="text-secondary mb-4">Manage the profile fields supported by your account.</p><form className="aic-card p-4" style={{ maxWidth: 640 }} onSubmit={save}><div className="mb-3"><label className="form-label small fw-semibold" htmlFor="academician-name">Name</label><input id="academician-name" className="form-control" value={profile.name || ''} disabled={!editing} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></div><div className="mb-3"><label className="form-label small fw-semibold" htmlFor="academician-email">Email</label><input id="academician-email" type="email" className="form-control" value={profile.email || ''} disabled /></div><div className="mb-3"><label className="form-label small fw-semibold" htmlFor="academician-role">Role</label><input id="academician-role" className="form-control" value={profile.role || ''} disabled /></div>{editing ? <div className="d-flex gap-2"><button type="submit" className="btn btn-aic-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button><button type="button" className="btn btn-aic-outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</button></div> : <button type="button" className="btn btn-aic-primary" onClick={() => setEditing(true)}>Edit Profile</button>}</form></div>
}
