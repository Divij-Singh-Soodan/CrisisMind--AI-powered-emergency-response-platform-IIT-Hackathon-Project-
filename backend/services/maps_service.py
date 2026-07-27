import math
from typing import Any

import httpx

from core.config import GOOGLE_MAPS_API_KEY
from schemas import NearbyPlace

PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"
PLACES_TEXT_URL = "https://places.googleapis.com/v1/places:searchText"
FIELD_MASK = "places.displayName,places.formattedAddress,places.location"

# Maps AI emergency_category -> Google Places includedTypes (Nearby Search)
CATEGORY_TO_PLACE_TYPE: dict[str, str] = {
    "Medical": "hospital",
    "Fire": "fire_station",
    "Security": "police",
}

# Fallback text queries when includedTypes is not available
CATEGORY_TO_SEARCH_TERM: dict[str, str] = {
    "Medical": "hospital",
    "Fire": "fire station",
    "Security": "police station",
    "Natural Disaster": "emergency shelter",
}


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Approximate distance in kilometers between two coordinates."""
    radius_km = 6371.0
    lat1_rad, lat2_rad = math.radians(lat1), math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(radius_km * c, 2)


def _parse_place(place: dict[str, Any], lat: float, lng: float) -> NearbyPlace:
    place_lat = place.get("location", {}).get("latitude", lat)
    place_lng = place.get("location", {}).get("longitude", lng)
    display_name = place.get("displayName", {}).get("text", "Unknown")

    return NearbyPlace(
        name=display_name,
        address=place.get("formattedAddress", "Address unavailable"),
        distance_km=_haversine_km(lat, lng, place_lat, place_lng),
    )


async def get_nearby_services(lat: float, lng: float, category: str) -> list[NearbyPlace]:
    if not GOOGLE_MAPS_API_KEY:
        raise ValueError("GOOGLE_MAPS_API_KEY is not configured")

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": FIELD_MASK,
    }

    location_bias = {
        "circle": {
            "center": {"latitude": lat, "longitude": lng},
            "radius": 10000.0,
        }
    }

    place_type = CATEGORY_TO_PLACE_TYPE.get(category)
    if place_type:
        payload = {
            "includedTypes": [place_type],
            "maxResultCount": 3,
            "locationRestriction": location_bias,
            "rankPreference": "DISTANCE",
        }
        url = PLACES_NEARBY_URL
    else:
        search_term = CATEGORY_TO_SEARCH_TERM.get(category, "emergency services")
        payload = {
            "textQuery": search_term,
            "maxResultCount": 3,
            "locationBias": location_bias,
        }
        url = PLACES_TEXT_URL

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.TimeoutException as exc:
        raise RuntimeError("Google Maps API request timed out") from exc
    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"Google Maps API error: {exc.response.status_code} {exc.response.text}"
        ) from exc
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Google Maps API request failed: {exc}") from exc

    places = data.get("places", [])
    parsed = [_parse_place(place, lat, lng) for place in places[:3]]
    return sorted(parsed, key=lambda p: p.distance_km)
