function AdviceList({ title, icon, items, accentClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className={`mb-4 flex items-center gap-2 text-lg font-semibold ${accentClass}`}>
        <span aria-hidden="true">{icon}</span>
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 text-sm leading-relaxed text-slate-700">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${accentClass.replace('text-', 'bg-')}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ActionAdvice({ immediateActions = [], thingsToAvoid = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AdviceList
        title="Immediate Actions"
        icon="✅"
        items={immediateActions}
        accentClass="text-emerald-700"
      />
      <AdviceList
        title="Things to Avoid"
        icon="❌"
        items={thingsToAvoid}
        accentClass="text-red-700"
      />
    </div>
  )
}

export default ActionAdvice
