import { useEffect, useState } from 'react'
import {
  getStudentNotifications,
  markStudentNotificationRead,
} from '../../api/studentApi'

const NOTIFICATIONS_CACHE_KEY = 'student_notifications'

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        NOTIFICATIONS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        NOTIFICATIONS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  // Load notifications from backend
  const loadNotifications = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      }

      setError('')

      const response = await getStudentNotifications()

      const data =
        response.data?.notifications || []

      setNotifications(data)

      // Save latest data to session cache
      sessionStorage.setItem(
        NOTIFICATIONS_CACHE_KEY,
        JSON.stringify(data)
      )
    } catch (err) {
      console.error(
        'Failed to load notifications:',
        err
      )

      setError(
        err.response?.data?.detail ||
          'Unable to load notifications.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fetch only when there is no cached data
  useEffect(() => {
    const cached = sessionStorage.getItem(
      NOTIFICATIONS_CACHE_KEY
    )

    if (!cached) {
      loadNotifications(false)
    }
  }, [])

  // Manual refresh
  const handleRefresh = () => {
    loadNotifications(true)
  }

  // Mark notification as read
  const handleMarkRead = async (notificationId) => {
    try {
      await markStudentNotificationRead(
        notificationId
      )

      setNotifications((current) => {
        const updated = current.map(
          (notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification
        )

        // Update cache
        sessionStorage.setItem(
          NOTIFICATIONS_CACHE_KEY,
          JSON.stringify(updated)
        )

        return updated
      })
    } catch (err) {
      console.error(
        'Failed to mark notification as read:',
        err
      )
    }
  }

  // Notification icon
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill text-success'

      case 'warning':
        return 'bi-exclamation-triangle-fill text-warning'

      case 'error':
        return 'bi-x-circle-fill text-danger'

      default:
        return 'bi-info-circle-fill text-primary'
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length

  const readCount =
    notifications.length - unreadCount

  // Initial loading
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">

          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-3 text-muted mb-0">
            Loading notifications...
          </p>

        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">

      {/* ================= HEADER ================= */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">

        <div>

          <div className="d-flex align-items-center gap-2 mb-1">

            <div className="aic-page-icon">
              <i className="bi bi-bell-fill"></i>
            </div>

            <h2 className="font-display fw-bold mb-0">
              Notifications
            </h2>

          </div>

          <p className="text-muted mb-0">
            Stay updated with your opportunities,
            applications and profile.
          </p>

        </div>

        <button
          type="button"
          className="btn btn-aic-outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <i
            className={`bi ${
              refreshing
                ? 'bi-arrow-repeat'
                : 'bi-arrow-clockwise'
            } me-2`}
          ></i>

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>

      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">

          <i className="bi bi-exclamation-circle-fill"></i>

          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Try Again
          </button>

        </div>
      )}

      {/* ================= SUMMARY ================= */}
      <div className="row g-3 mb-4">

        {/* Total */}
        <div className="col-md-4">

          <div className="aic-card h-100">

            <div className="d-flex align-items-center gap-3">

              <div className="aic-stat-icon">
                <i className="bi bi-bell"></i>
              </div>

              <div>

                <div className="text-muted small">
                  Total Notifications
                </div>

                <div className="fs-4 fw-bold">
                  {notifications.length}
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Unread */}
        <div className="col-md-4">

          <div className="aic-card h-100">

            <div className="d-flex align-items-center gap-3">

              <div className="aic-stat-icon">
                <i className="bi bi-envelope-fill"></i>
              </div>

              <div>

                <div className="text-muted small">
                  Unread
                </div>

                <div className="fs-4 fw-bold">
                  {unreadCount}
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Read */}
        <div className="col-md-4">

          <div className="aic-card h-100">

            <div className="d-flex align-items-center gap-3">

              <div className="aic-stat-icon">
                <i className="bi bi-check2-circle"></i>
              </div>

              <div>

                <div className="text-muted small">
                  Read
                </div>

                <div className="fs-4 fw-bold">
                  {readCount}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================= EMPTY STATE ================= */}
      {notifications.length === 0 ? (

        <div className="aic-card">

          <div className="text-center py-5">

            <div className="display-5 text-muted mb-3">
              <i className="bi bi-bell-slash"></i>
            </div>

            <h5 className="fw-bold">
              No notifications yet
            </h5>

            <p className="text-muted mb-0">
              You're all caught up! New updates
              will appear here.
            </p>

          </div>

        </div>

      ) : (

        /* ================= NOTIFICATION LIST ================= */
        <div className="aic-card p-0 overflow-hidden">

          {notifications.map(
            (notification, index) => (

              <div
                key={notification.id}
                className={`p-4 ${
                  index !==
                  notifications.length - 1
                    ? 'border-bottom'
                    : ''
                } ${
                  !notification.is_read
                    ? 'bg-light'
                    : ''
                }`}
              >

                <div className="d-flex gap-3">

                  {/* Icon */}
                  <div className="fs-4 flex-shrink-0">

                    <i
                      className={`bi ${getIcon(
                        notification.notification_type
                      )}`}
                    ></i>

                  </div>

                  {/* Content */}
                  <div className="flex-grow-1">

                    <div className="d-flex justify-content-between align-items-start gap-3">

                      <div>

                        <div className="d-flex align-items-center gap-2 mb-1">

                          <h6 className="fw-bold mb-0">
                            {notification.title}
                          </h6>

                          {!notification.is_read && (
                            <span className="badge bg-primary">
                              New
                            </span>
                          )}

                        </div>

                        <p className="text-muted mb-2">
                          {notification.message}
                        </p>

                      </div>

                    </div>

                    {/* Bottom row */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">

                      <small className="text-muted">

                        <i className="bi bi-clock me-1"></i>

                        {notification.created_at
                          ? new Date(
                              notification.created_at
                            ).toLocaleString()
                          : ''}

                      </small>

                      {!notification.is_read && (

                        <button
                          type="button"
                          className="btn btn-sm btn-aic-outline"
                          onClick={() =>
                            handleMarkRead(
                              notification.id
                            )
                          }
                        >

                          <i className="bi bi-check2 me-1"></i>

                          Mark as read

                        </button>

                      )}

                    </div>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  )
}