import os
import httpx
import logging
import json
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load .env from backend dir first, then fall back to project root
_backend_env = Path(__file__).parent / ".env"
_root_env    = Path(__file__).parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(_backend_env)
elif _root_env.exists():
    load_dotenv(_root_env)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

if GEMINI_API_KEY:
    logger.info(f"GEMINI_API_KEY loaded (prefix: {GEMINI_API_KEY[:8]}...)")
else:
    logger.warning("GEMINI_API_KEY is NOT set — AI features will use fallbacks.")

async def get_explanation(
    predicted_label_name: str,
    confidence: float,
    is_recognized: bool,
    class_probabilities: dict = None
) -> str:
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set. Using fallback explanation.")
        return get_fallback_explanation(predicted_label_name, is_recognized)

    SUPPORTED_CLASSES = ", ".join(class_probabilities.keys()) if class_probabilities else "Acne, Carcinoma, Eczema, Keratosis, Milia, Rosacea"
    probs_str = json.dumps({k: f"{v:.2f}" for k, v in class_probabilities.items()}) if class_probabilities else "{}"
    label_name = predicted_label_name

    prompt = f"""You are an experienced dermatologist assistant, not a doctor. You DO NOT see the image directly.
You only see the machine-learning model's output.

MODEL OUTPUT:
- supported_classes: {SUPPORTED_CLASSES}
- is_recognized: {is_recognized}
- top_prediction: {label_name}
- top_confidence: {confidence:.2f}
- class_probabilities: {probs_str}

TASK:

1. If is_recognized is FALSE (for example label_name starts with "Unknown"):
   - Clearly say that the system could not confidently match this image to any of the supported skin conditions.
   - Explain that it might be something outside these 6 conditions (for example, a cut, burn, injury, normal skin, or a different disease), but DO NOT guess a specific diagnosis.
   - Encourage the user to upload a clearer close-up of the skin area if appropriate.
   - Strongly recommend seeing a qualified doctor if they are worried, if there is significant pain, active bleeding, rapid spreading, or systemic symptoms (fever, feeling very sick).

2. If is_recognized is TRUE:
   - Start with: "The model suggests that this may be {{label_name}} with about {{confidence:.0%}} confidence."
   - Briefly describe what {{label_name}} typically is, in simple language (1–2 sentences).
   - List 3–5 common symptoms and patterns for this condition (bulleted list).
   - Mention very briefly when this condition can usually be monitored at home vs. when a doctor visit is important.
   - Do NOT mention treatments that require prescriptions by name; keep advice high-level and generic (for example, "gentle skincare", "avoid known triggers").

3. In ALL cases:
   - End with a strong disclaimer like:
     "This is only an educational explanation based on a computer model and is NOT a medical diagnosis. Always consult a doctor or dermatologist for real medical advice."

Style:
- Use friendly, calm language.
- Keep the answer under 180 words.
- Never say that the user 'has' a disease; always use uncertain language like "may be", "might be consistent with".
"""

    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers=headers,
                json=payload,
                timeout=15.0
            )
            response.raise_for_status()
            data = response.json()
            
            if "candidates" in data and len(data["candidates"]) > 0:
                explanation = data["candidates"][0]["content"]["parts"][0]["text"]
                return explanation
            else:
                logger.error("Unexpected response format from Gemini API.")
                return get_fallback_explanation(predicted_label_name, is_recognized)
                
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        return get_fallback_explanation(predicted_label_name, is_recognized)

def get_fallback_explanation(predicted_label_name: str, is_recognized: bool) -> str:
    if is_recognized:
        return f"This image resembles {predicted_label_name}. Typical symptoms vary but often require medical evaluation. Please consult a dermatologist for an accurate diagnosis."
    else:
        return "The system could not confidently recognize the skin condition in this image. It may not be one of the supported conditions or the image quality might be insufficient. Please consult a doctor."

class GeminiUnavailableError(Exception):
    """Raised when the Gemini API cannot be reached or returns an error."""
    pass

async def get_chat_response(user_message: str) -> str:
    """Chat endpoint for conversational AI companion."""
    if not GEMINI_API_KEY:
        raise GeminiUnavailableError("GEMINI_API_KEY is not configured.")

    prompt = f"""You are AllerCheck AI, a friendly and knowledgeable dermatologist assistant on the AllerCheck platform.
Your role is to help users understand skin conditions and allergies in an educational context.

User question: {user_message}

Instructions:
- Be helpful, friendly, and professional
- Keep your response under 200 words
- Use bullet points (•) when listing items
- Use **bold** for key terms
- Never diagnose; always use uncertain language ("may be", "could indicate")
- Never name prescription medications
- Always end with: "⚕️ *Educational information only. Consult a doctor for medical advice.*"
- If asked about emergencies, always direct to seek immediate care
"""

    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers=headers,
                json=payload,
                timeout=20.0
            )
            if not response.is_success:
                err_body = response.text[:500]
                logger.error(f"Gemini API error {response.status_code}: {err_body}")
                raise GeminiUnavailableError(f"Gemini API returned HTTP {response.status_code}. Check quota and billing.")
            data = response.json()
            if "candidates" in data and len(data["candidates"]) > 0:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            raise GeminiUnavailableError("Unexpected response format from Gemini API.")
    except GeminiUnavailableError:
        raise
    except httpx.TimeoutException:
        logger.error("Gemini API request timed out.")
        raise GeminiUnavailableError("Gemini API request timed out.")
    except Exception as e:
        logger.error(f"Error in get_chat_response: {type(e).__name__}: {e}")
        raise GeminiUnavailableError(f"Unexpected error: {e}")

async def get_allergy_prediction(symptoms: str, exposure_context: str, triggers: str) -> dict:
    """Predict allergy type from free-text symptom description using Gemini."""
    if not GEMINI_API_KEY:
        return {
            "allergy_type": "Unknown",
            "confidence": 0,
            "reasoning": "AI prediction requires a GEMINI_API_KEY to be configured.",
            "recommendations": ["Please consult a doctor for allergy testing."],
            "urgency": "low",
            "disclaimer": "This is an educational tool only."
        }

    prompt = f"""You are an expert allergy specialist AI assistant on the AllerCheck medical platform.
A patient has described their symptoms. Based ONLY on the information provided, analyze and predict the most likely allergy type.

PATIENT INPUT:
- Observable Symptoms: {symptoms if symptoms else "Not provided"}
- Exposure Context: {exposure_context if exposure_context else "Not provided"}
- Triggers (Food/Drug): {triggers if triggers else "Not provided"}

ALLERGY TYPES TO CONSIDER:
1. Food Allergy - reaction to nuts, shellfish, dairy, wheat, soy, eggs
2. Skin/Contact Allergy - reaction to latex, fragrances, nickel, cosmetics, plants
3. Dust/Environmental Allergy - dust mites, pet dander, mold, indoor allergens
4. Pollen/Seasonal Allergy - tree, grass, ragweed pollen, hay fever
5. Drug/Medication Allergy - antibiotics, NSAIDs, aspirin, contrast dyes
6. Insect Sting Allergy - bee, wasp, ant stings
7. Multiple/Mixed Allergies - combination of the above

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{{
  "allergy_type": "<most likely type from the list above>",
  "confidence": <integer 0-100>,
  "secondary_type": "<second most likely type or null>",
  "secondary_confidence": <integer 0-100 or 0>,
  "reasoning": "<2-3 sentences explaining why based on the symptoms>",
  "key_indicators": ["<symptom 1>", "<symptom 2>", "<symptom 3>"],
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"],
  "urgency": "<low|medium|high>",
  "disclaimer": "This is an AI-based educational screening tool. Results are not a medical diagnosis. Please consult a qualified allergist for proper testing."
}}"""

    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers=headers,
                json=payload,
                timeout=25.0
            )
            response.raise_for_status()
            data = response.json()
            if "candidates" in data and len(data["candidates"]) > 0:
                raw = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Strip markdown code blocks if present
                if raw.startswith("```"):
                    raw = raw.split("```")[1]
                    if raw.startswith("json"):
                        raw = raw[4:]
                result = json.loads(raw.strip())
                return result
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error in allergy prediction: {e}")
    except Exception as e:
        logger.error(f"Error in get_allergy_prediction: {e}")

    # Fallback rule-based prediction
    symptoms_lower = (symptoms + " " + exposure_context + " " + triggers).lower()
    if any(w in symptoms_lower for w in ["pollen", "spring", "outdoor", "sneezing", "hay fever"]):
        allergy_type = "Pollen/Seasonal Allergy"
    elif any(w in symptoms_lower for w in ["food", "eating", "nut", "dairy", "shellfish", "stomach"]):
        allergy_type = "Food Allergy"
    elif any(w in symptoms_lower for w in ["dust", "indoor", "mite", "pet", "dander"]):
        allergy_type = "Dust/Environmental Allergy"
    elif any(w in symptoms_lower for w in ["drug", "medication", "antibiotic", "aspirin", "penicillin"]):
        allergy_type = "Drug/Medication Allergy"
    elif any(w in symptoms_lower for w in ["rash", "contact", "latex", "nickel", "fragrance"]):
        allergy_type = "Skin/Contact Allergy"
    else:
        allergy_type = "Multiple/Mixed Allergies"

    return {
        "allergy_type": allergy_type,
        "confidence": 55,
        "secondary_type": None,
        "secondary_confidence": 0,
        "reasoning": "Based on the symptoms described, this is the most likely allergy category. AI analysis was unavailable; this is a rule-based estimate.",
        "key_indicators": [s.strip() for s in symptoms.split(",")[:3] if s.strip()],
        "recommendations": ["Consult an allergist for proper skin-prick or blood testing.", "Keep a symptom diary to identify patterns.", "Avoid suspected triggers while awaiting diagnosis."],
        "urgency": "medium",
        "disclaimer": "This is an AI-based educational screening tool. Results are not a medical diagnosis. Please consult a qualified allergist."
    }
