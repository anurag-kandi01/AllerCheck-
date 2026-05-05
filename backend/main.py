import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import traceback

from ml_model import load_model, predict_image
from gemini_client import get_explanation

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Skin Conditions API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*" # Keeping wildcard as fallback for dev, but explicit origins are preferred
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting API, loading ML model...")
    load_model()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    logger.info(f"/predict called with file: {image.filename}, type: {image.content_type}")
    
    # Basic validation
    if not image.content_type.startswith("image/"):
        logger.warning(f"Invalid file type uploaded: {image.content_type}")
        raise HTTPException(status_code=400, detail="File must be an image.")
    
    try:
        contents = await image.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")
            
        result = predict_image(contents)
        logger.info(f"Prediction successful: {result['predicted_label_name']} ({result['confidence']:.2f})")
        return result
    except ValueError as e:
        logger.error(f"Value error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Error during prediction: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail="Could not process the image. Ensure it's a valid image file.")

@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):
    logger.info(f"/analyze called with file: {image.filename}")

    # Run predict logic
    try:
        prediction_result = await predict(image)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Prediction failed in /analyze: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed.")

    # Get Gemini explanation
    try:
        explanation = await get_explanation(
            prediction_result["predicted_label_name"],
            prediction_result["confidence"],
            prediction_result["is_recognized"],
            prediction_result["class_probabilities"]
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to get explanation: {e}")
        explanation = "Error generating explanation."

    # Assemble response
    response = {
        **prediction_result,
        "explanation": explanation,
        "disclaimer": "This app is for educational purposes only and does not provide a medical diagnosis. Please consult a qualified doctor."
    }
    
    logger.info("Analysis completed successfully.")
    return response
