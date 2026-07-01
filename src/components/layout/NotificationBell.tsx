'use client'
import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { markReadAction, markAllReadAction } from '@/server/actions/notifications'
import type { NotificationRow } from '@/server/services/notification.service'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function KindIcon({ kind }: { kind: NotificationRow['kind'] }) {
  if (kind === 'budget_alert') {
    return (
      <span className="shrink-0 w-7 h-7 rounded-full bg-danger-bg flex items-center justify-center" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-danger">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </span>
    )
  }
  if (kind === 'insight') {
    return (
      <span className="shrink-0 w-7 h-7 rounded-full bg-accent-light flex items-center justify-center" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-accent">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      </span>
    )
  }
  return (
    <span className="shrink-0 w-7 h-7 rounded-full bg-surface-r flex items-center justify-center" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-ink-muted">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
    </span>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 gap-3">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-ink-muted" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.251 2.251 0 0 1 2.012 1.244l.256.512a2.251 2.251 0 0 0 2.013 1.244h3.218a2.251 2.251 0 0 0 2.013-1.244l.256-.512a2.251 2.251 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
      </svg>
      <p className="text-sm text-ink-muted">No notifications</p>
    </div>
  )
}

// Auto-marks an unread notification as read when it scrolls into view
function NotificationItem({
  n,
  listRef,
  onRead,
  isPending,
}: {
  n: NotificationRow
  listRef: React.RefObject<HTMLDivElement | null>
  onRead: (id: string) => void
  isPending: boolean
}) {
  const itemRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (n.isRead || !itemRef.current || !listRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onRead(n._id)
          observer.disconnect()
        }
      },
      { root: listRef.current, threshold: 0.6 },
    )
    observer.observe(itemRef.current)
    return () => observer.disconnect()
  }, [n._id, n.isRead, listRef, onRead])

  return (
    <li ref={itemRef}>
      <div
        className={`w-full flex items-start gap-2.5 px-3 py-3 text-left transition-colors hover:bg-surface-r ${
          n.isRead ? 'opacity-60' : ''
        }`}
      >
        <KindIcon kind={n.kind} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink leading-snug truncate">{n.title}</p>
          {n.body && (
            <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{n.body}</p>
          )}
          <p className="text-xs text-ink-muted mt-1">{timeAgo(n.createdAt)}</p>
        </div>
        {!n.isRead && (
          <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-brand" aria-label="Unread" />
        )}
      </div>
      <div className="h-px bg-border mx-3" aria-hidden="true" />
    </li>
  )
}

interface NotificationBellProps {
  initialNotifications: NotificationRow[]
}

export function NotificationBell({ initialNotifications }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationRow[]>(initialNotifications)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const visible = notifications.slice(0, 10)

  useEffect(() => {
    function handle(e: Event) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handle)
      document.addEventListener('touchstart', handle)
    }
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [open])

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const notif = prev.find((n) => n._id === id)
      if (!notif || notif.isRead) return prev
      startTransition(async () => { await markReadAction(id) })
      return prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    })
  }, [startTransition])

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    startTransition(async () => { await markAllReadAction() })
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-surface-r transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand text-white text-[10px] font-semibold flex items-center justify-center leading-none" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 w-[min(320px,calc(100vw-2rem))] bg-surface border border-border rounded-xl shadow-lg shadow-black/8 animate-scale-in z-50 origin-top-right overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <span className="text-sm font-semibold text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-xs font-medium px-2 py-1 rounded-md bg-forest/10 text-forest hover:bg-forest/20 dark:bg-forest/20 dark:text-forest dark:hover:bg-forest/30 transition-colors disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div ref={listRef} className="max-h-[360px] overflow-y-auto">
            {visible.length === 0 ? (
              <EmptyState />
            ) : (
              <ul role="list">
                {visible.map((n) => (
                  <NotificationItem
                    key={n._id}
                    n={n}
                    listRef={listRef}
                    onRead={handleMarkRead}
                    isPending={isPending}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
