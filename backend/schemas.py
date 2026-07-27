from typing import Optional

from pydantic import BaseModel, Field


class EmergencyRequest(BaseModel):
    user_message: str = Field(..., min_length=1, description="Description of the emergency")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)


class EmergencyAssessment(BaseModel):
    severity: str = Field(
        ...,
        description="Urgency level: Low, Medium, High, or Critical",
    )
    emergency_category: str = Field(
        ...,
        description="Category such as Medical, Fire, Security, or Natural Disaster",
    )
    immediate_actions: list[str] = Field(
        ...,
        description="Step-by-step first-aid or safety advice",
    )
    things_to_avoid: list[str] = Field(
        ...,
        description="Actions the user should NOT take",
    )
    situational_summary: str = Field(
        ...,
        description="Short summary of the emergency situation",
    )


class NearbyPlace(BaseModel):
    name: str
    address: str
    distance_km: float


class EmergencyResponse(BaseModel):
    assessment: EmergencyAssessment
    nearby_places: list[NearbyPlace] = Field(default_factory=list)
