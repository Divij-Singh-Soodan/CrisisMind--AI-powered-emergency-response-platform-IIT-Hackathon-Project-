import ActionAdvice from './ActionAdvice'
import NearbyServices from './NearbyServices'
import SeverityIndicator from './SeverityIndicator'

function EmergencyResponse({ data }) {
  const { assessment, nearby_places: nearbyPlaces } = data

  return (
    <section className="space-y-6">
      <SeverityIndicator
        severity={assessment.severity}
        category={assessment.emergency_category}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Situation Summary
        </h3>
        <p className="text-base leading-relaxed text-slate-800">
          {assessment.situational_summary}
        </p>
      </div>

      <ActionAdvice
        immediateActions={assessment.immediate_actions}
        thingsToAvoid={assessment.things_to_avoid}
      />

      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Nearby Emergency Services
        </h3>
        <NearbyServices places={nearbyPlaces} />
      </div>
    </section>
  )
}

export default EmergencyResponse
