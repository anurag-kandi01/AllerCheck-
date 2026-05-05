import os
import httpx
import logging
import json

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

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
