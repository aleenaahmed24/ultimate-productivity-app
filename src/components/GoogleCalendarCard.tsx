import { CalendarDays, ExternalLink, Loader2, RefreshCw, Unlink } from 'lucide-react'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'

function formatTime(iso: string | null, allDay: boolean) {
  if (!iso) return ''
  if (allDay) return 'All day'
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function GoogleCalendarCard() {
  const { status, events, errorMessage, connect, disconnect, refresh } = useGoogleCalendar()

  if (status === 'not-configured') {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <CalendarDays size={16} className="text-[var(--text-muted)]" />
          Google Calendar
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Not set up yet — add a Google OAuth client ID as{' '}
          <code className="rounded bg-[var(--surface-2)] px-1 py-0.5">VITE_GOOGLE_CLIENT_ID</code>{' '}
          to enable connecting a calendar.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <CalendarDays size={16} className="text-[var(--primary)]" />
          Google Calendar
        </div>
        {status === 'connected' && (
          <div className="flex items-center gap-1">
            <button
              onClick={refresh}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              aria-label="Refresh events"
            >
              <RefreshCw size={13} />
            </button>
            <button
              onClick={disconnect}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
              aria-label="Disconnect Google Calendar"
            >
              <Unlink size={13} />
            </button>
          </div>
        )}
      </div>

      {status === 'idle' && (
        <>
          <p className="text-xs text-[var(--text-muted)]">
            Connect your calendar to see today's events here.
          </p>
          <button
            onClick={connect}
            className="rounded-xl gradient-bg py-2 text-sm font-semibold text-white"
          >
            Connect Google Calendar
          </button>
        </>
      )}

      {status === 'connecting' && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-[var(--text-muted)]">
          <Loader2 size={15} className="animate-spin" />
          Waiting for Google sign-in...
        </div>
      )}

      {status === 'error' && (
        <>
          <p className="text-xs text-red-500">{errorMessage ?? 'Something went wrong.'}</p>
          <button
            onClick={connect}
            className="rounded-xl border border-[var(--border)] py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
          >
            Try again
          </button>
        </>
      )}

      {status === 'connected' && (
        <div className="flex flex-col gap-1.5">
          {errorMessage && <p className="text-xs text-[var(--text-muted)]">{errorMessage}</p>}
          {events.length === 0 ? (
            <p className="py-3 text-center text-sm text-[var(--text-muted)]">
              No events today — clear calendar.
            </p>
          ) : (
            events.map((ev) => (
              <a
                key={ev.id}
                href={ev.htmlLink}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--surface-2)]"
              >
                <span className="w-16 shrink-0 text-xs font-medium text-[var(--text-muted)]">
                  {formatTime(ev.start, ev.allDay)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--text)]">
                  {ev.title}
                </span>
                <ExternalLink
                  size={12}
                  className="shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100"
                />
              </a>
            ))
          )}
        </div>
      )}
    </div>
  )
}
