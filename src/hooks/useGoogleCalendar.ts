import { useCallback, useEffect, useRef, useState } from 'react'
import type { GoogleCalendarEvent } from '../types'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly'
const STORAGE_KEY = 'summit_gcal_token'
const GSI_SRC = 'https://accounts.google.com/gsi/client'

type Status = 'not-configured' | 'idle' | 'connecting' | 'connected' | 'error'

interface StoredToken {
  accessToken: string
  expiresAt: number
}

interface TokenResponse {
  access_token?: string
  expires_in?: number
  error?: string
}

interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (resp: TokenResponse) => void
          }) => TokenClient
          revoke: (token: string, done: () => void) => void
        }
      }
    }
  }
}

let gsiLoadPromise: Promise<void> | null = null

function loadGsiScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (gsiLoadPromise) return gsiLoadPromise
  gsiLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
  return gsiLoadPromise
}

function readStoredToken(): StoredToken | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredToken
    if (!parsed.accessToken || parsed.expiresAt < Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredToken(token: StoredToken) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(token))
}

function clearStoredToken() {
  sessionStorage.removeItem(STORAGE_KEY)
}

async function fetchTodaysEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '20',
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (res.status === 401) {
    throw new Error('unauthorized')
  }
  if (!res.ok) {
    throw new Error(`Google Calendar request failed (${res.status})`)
  }

  const data = await res.json()
  const items = Array.isArray(data.items) ? data.items : []

  return items.map(
    (item: {
      id: string
      summary?: string
      htmlLink: string
      start?: { date?: string; dateTime?: string }
      end?: { date?: string; dateTime?: string }
    }) => ({
      id: item.id,
      title: item.summary ?? '(No title)',
      start: item.start?.dateTime ?? item.start?.date ?? null,
      end: item.end?.dateTime ?? item.end?.date ?? null,
      allDay: !item.start?.dateTime,
      htmlLink: item.htmlLink,
    }),
  )
}

function initialStatus(): Status {
  if (!CLIENT_ID) return 'not-configured'
  return readStoredToken() ? 'connected' : 'idle'
}

export function useGoogleCalendar() {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const tokenClientRef = useRef<TokenClient | null>(null)

  const loadEvents = useCallback(async (accessToken: string) => {
    try {
      const items = await fetchTodaysEvents(accessToken)
      setEvents(items)
      setStatus('connected')
      setErrorMessage(null)
    } catch (e) {
      if (e instanceof Error && e.message === 'unauthorized') {
        clearStoredToken()
        setStatus('idle')
        setErrorMessage('Your Google session expired — reconnect to see events again.')
      } else {
        setStatus('error')
        setErrorMessage(e instanceof Error ? e.message : 'Something went wrong.')
      }
    }
  }, [])

  useEffect(() => {
    const stored = readStoredToken()
    if (stored) loadEvents(stored.accessToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connect = useCallback(async () => {
    if (!CLIENT_ID) return
    setStatus('connecting')
    setErrorMessage(null)
    try {
      await loadGsiScript()
      if (!tokenClientRef.current) {
        tokenClientRef.current = window.google!.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPE,
          callback: (resp) => {
            if (resp.error || !resp.access_token) {
              setStatus('error')
              setErrorMessage('Google sign-in was cancelled or denied.')
              return
            }
            const token: StoredToken = {
              accessToken: resp.access_token,
              expiresAt: Date.now() + (resp.expires_in ?? 3500) * 1000,
            }
            writeStoredToken(token)
            loadEvents(token.accessToken)
          },
        })
      }
      tokenClientRef.current.requestAccessToken()
    } catch (e) {
      setStatus('error')
      setErrorMessage(e instanceof Error ? e.message : 'Could not load Google sign-in.')
    }
  }, [loadEvents])

  const disconnect = useCallback(() => {
    const stored = readStoredToken()
    clearStoredToken()
    setEvents([])
    setStatus('idle')
    setErrorMessage(null)
    if (stored && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(stored.accessToken, () => {})
    }
  }, [])

  const refresh = useCallback(() => {
    const stored = readStoredToken()
    if (stored) loadEvents(stored.accessToken)
  }, [loadEvents])

  return { status, events, errorMessage, connect, disconnect, refresh }
}
