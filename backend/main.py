import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import EmergencyRequest, EmergencyResponse
from services.ai_service import analyze_emergency
from services.maps_service import get_nearby_services

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CrisisMind API",
    description="AI-powered emergency response platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "ok", "message": "CrisisMind API is running"}


@app.post("/api/emergency", response_model=EmergencyResponse)
async def handle_emergency(request: EmergencyRequest):
    try:
        assessment = await analyze_emergency(request.user_message)
    except ValueError as exc:
        logger.warning("Invalid AI input or response: %s", exc)
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        logger.error("AI service error: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected error during AI analysis")
        raise HTTPException(status_code=500, detail="Failed to analyze emergency") from exc

    nearby_places = []
    has_coordinates = request.latitude is not None and request.longitude is not None

    if has_coordinates:
        try:
            nearby_places = await get_nearby_services(
                lat=request.latitude,
                lng=request.longitude,
                category=assessment.emergency_category,
            )
        except ValueError as exc:
            logger.warning("Maps configuration error: %s", exc)
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        except RuntimeError as exc:
            logger.error("Maps service error: %s", exc)
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        except Exception as exc:
            logger.exception("Unexpected error during maps lookup")
            raise HTTPException(
                status_code=500, detail="Failed to fetch nearby emergency services"
            ) from exc

    return EmergencyResponse(assessment=assessment, nearby_places=nearby_places)
