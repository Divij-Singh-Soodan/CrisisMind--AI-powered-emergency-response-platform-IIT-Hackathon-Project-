import { useEffect, useState } from 'react'

import EmergencyResponse from './components/EmergencyResponse'

const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.2090 }
const REQUEST_TIMEOUT_MS = 45000

function App() {
  const [userMessage, setUserMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emergencyData, setEmergencyData] = useState(null)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(DEFAULT_LOCATION)
  const [locationLabel, setLocationLabel] = useState('New Delhi, India (simulated)')

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationLabel('Your current location')
      },
      () => {
        setLocation(DEFAULT_LOCATION)
        setLocationLabel('New Delhi, India (simulated fallback)')
      },
      { timeout: 5000, maximumAge: 60000 },
    )
  }, [])

  async function handleEmergencySubmit(event) {
    event.preventDefault()

    const trimmedMessage = userMessage.trim()
    if (!trimmedMessage) {
      setError('Please describe your emergency before submitting.')
      return
    }

    setIsLoading(true)
    setError(null)
    setEmergencyData(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: trimmedMessage,
          latitude: location.lat,
          longitude: location.lng,
        }),
        signal: controller.signal,
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        const detail =
          typeof payload?.detail === 'string'
            ? payload.detail
            : 'The server could not process your emergency request.'
        throw new Error(detail)
      }

      setEmergencyData(payload)
    } catch (submitError) {
      if (submitError.name === 'AbortError') {
        setError('Request timed out. Please check that the backend is running and try again.')
      } else if (submitError instanceof TypeError) {
        setError('Unable to reach the server. Make sure the FastAPI backend is running on port 8000.')
      } else {
        setError(submitError.message || 'Something went wrong. Please try again.')
      }
    } finally {
      clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }

  function handleReset() {
    setUserMessage('')
    setEmergencyData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-100">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg font-bold text-white shadow-md">
              CM
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">CrisisMind</h1>
              <p className="text-xs text-slate-500">AI Emergency Response Assistant</p>
            </div>
          </div>
          <span className="hidden rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 sm:inline">
            Emergency Ready
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Describe your emergency</h2>
            <p className="mt-1 text-sm text-slate-600">
              Tell us what happened. CrisisMind will assess severity, provide immediate guidance,
              and locate nearby help.
            </p>
          </div>

          <form onSubmit={handleEmergencySubmit} className="space-y-4">
            <div>
              <label htmlFor="emergency-message" className="mb-2 block text-sm font-medium text-slate-700">
                What is happening?
              </label>
              <textarea
                id="emergency-message"
                rows={4}
                value={userMessage}
                onChange={(event) => setUserMessage(event.target.value)}
                placeholder="Example: My father suddenly has severe chest pain and is sweating heavily."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <span>
                Location: <strong className="text-slate-800">{locationLabel}</strong>
              </span>
              <span>
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isLoading || !userMessage.trim()}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Analyzing emergency…' : 'Get Emergency Guidance'}
              </button>

              {(emergencyData || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Start Over
                </button>
              )}
            </div>
          </form>
        </section>

        {isLoading && (
          <section className="rounded-2xl border border-blue-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="font-medium text-slate-800">Analyzing your emergency…</p>
            <p className="mt-1 text-sm text-slate-500">
              AI is assessing severity and searching for nearby services.
            </p>
          </section>
        )}

        {!isLoading && emergencyData && <EmergencyResponse data={emergencyData} />}

        {!isLoading && !emergencyData && !error && (
          <section className="grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Instant Assessment', desc: 'AI classifies severity and emergency type in seconds.' },
              { title: 'Actionable Guidance', desc: 'Clear do\'s and don\'ts while help is on the way.' },
              { title: 'Nearby Services', desc: 'Find the closest hospitals, police, or fire stations.' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-4xl px-4 pb-8 text-center text-xs text-slate-500 sm:px-6">
        CrisisMind MVP — For life-threatening emergencies, call your local emergency number immediately.
      </footer>
    </div>
  )
}

export default App
