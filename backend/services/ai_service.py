import asyncio

from google import genai

from core.config import GEMINI_API_KEY
from schemas import EmergencyAssessment

client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = (
    "You are CrisisMind, an expert emergency assessment AI. "
    "Analyze the user's emergency description and return a structured assessment. "
    "Set severity to one of: Low, Medium, High, Critical. "
    "Set emergency_category to one of: Medical, Fire, Security, Natural Disaster. "
    "Provide clear, actionable immediate_actions and things_to_avoid. "
    "Keep situational_summary concise (1-2 sentences)."
)


def _generate_assessment(text: str) -> EmergencyAssessment:
    prompt = f"{SYSTEM_PROMPT}\n\nEmergency description:\n{text}"

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": EmergencyAssessment,
        },
    )

    parsed = response.parsed
    if parsed is None:
        raise ValueError("Failed to parse emergency assessment from AI response")

    return parsed


async def analyze_emergency(text: str) -> EmergencyAssessment:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured")

    try:
        return await asyncio.to_thread(_generate_assessment, text)
    except ValueError:
        raise
    except Exception as exc:
        raise RuntimeError(f"Gemini API error: {exc}") from exc
