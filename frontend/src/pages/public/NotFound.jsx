import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-6 font-display mb-2">Page not found</h1>
      <p className="text-secondary mb-4">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn btn-aic-primary">
        Back to home
      </Link>
    </div>
  )
}
