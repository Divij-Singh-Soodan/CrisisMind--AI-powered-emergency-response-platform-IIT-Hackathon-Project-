const SEVERITY_STYLES = {
  Low: {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    banner: 'from-emerald-500 to-emerald-600',
    dot: 'bg-emerald-400',
  },
  Medium: {
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    banner: 'from-amber-500 to-orange-500',
    dot: 'bg-amber-400',
  },
  High: {
    badge: 'bg-orange-100 text-orange-900 border-orange-300',
    banner: 'from-orange-500 to-red-500',
    dot: 'bg-orange-400',
  },
  Critical: {
    badge: 'bg-red-100 text-red-900 border-red-300',
    banner: 'from-red-600 to-red-800',
    dot: 'bg-red-400 animate-pulse',
  },
}

function normalizeSeverity(severity) {
  const match = Object.keys(SEVERITY_STYLES).find(
    (level) => level.toLowerCase() === severity?.toLowerCase(),
  )
  return match ?? 'Medium'
}

function SeverityIndicator({ severity, category }) {
  const level = normalizeSeverity(severity)
  const styles = SEVERITY_STYLES[level]

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${styles.banner} p-5 text-white shadow-lg`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Severity Level
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${styles.dot}`} />
            <h2 className="text-3xl font-bold">{level}</h2>
          </div>
        </div>
        {category && (
          <span
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${styles.badge}`}
          >
            {category}
          </span>
        )}
      </div>
    </div>
  )
}

export default SeverityIndicator
