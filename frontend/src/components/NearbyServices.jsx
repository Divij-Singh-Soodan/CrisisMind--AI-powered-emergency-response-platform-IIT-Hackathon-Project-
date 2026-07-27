function getDirectionsUrl(address, name) {
  const query = encodeURIComponent(`${name}, ${address}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

function NearbyServices({ places = [] }) {
  if (places.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No nearby emergency services found for your location.
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place, index) => (
        <article
          key={`${place.name}-${index}`}
          className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{place.name}</h3>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {place.distance_km} km
            </span>
          </div>
          <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">{place.address}</p>
          <a
            href={getDirectionsUrl(place.address, place.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Get Directions
          </a>
        </article>
      ))}
    </div>
  )
}

export default NearbyServices
