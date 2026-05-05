import os
import json
import numpy as np
import tensorflow as tf  # type: ignore
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models", "skin_conditions_classifier")
LABELS_FILE = os.path.join(os.path.dirname(__file__), "models", "labels.json")

# Global variables for model and labels
model = None
infer = None
labels = []

def load_model():
    global model, infer, labels
    try:
        if os.path.exists(LABELS_FILE):
            with open(LABELS_FILE, "r") as f:
                labels = json.load(f)
            logger.info(f"Loaded {len(labels)} labels.")
        else:
            logger.warning(f"Labels file not found at {LABELS_FILE}")
            
        if os.path.exists(MODEL_DIR) and os.listdir(MODEL_DIR):
            logger.info(f"Loading SavedModel from {MODEL_DIR}...")
            model = tf.saved_model.load(MODEL_DIR)
            infer = model.signatures["serving_default"]
            logger.info("Loaded SavedModel, using serving_default signature for inference.")
        else:
            logger.warning(f"SavedModel directory {MODEL_DIR} is empty or not found. Inference will not work until a model is provided.")
    except Exception as e:
        logger.error(f"Error loading model or labels: {e}")

def predict_image(image_bytes: bytes):
    if model is None or infer is None:
        raise ValueError("Model is not loaded. Please provide a SavedModel.")
    if not labels:
        raise ValueError("Labels are not loaded. Please provide labels.json.")

    try:
        logger.info(f"Predicting on image of size {len(image_bytes)} bytes")
        # Open as RGB
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Resize to 224x224
        image = image.resize((224, 224))
        
        # Convert to numpy array and float32
        img_array = np.array(image, dtype=np.float32)
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Apply EfficientNet preprocessing
        img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)
        
        # Run inference
        logger.debug("Running inference through SavedModel...")
        tensor_input = tf.convert_to_tensor(img_array)
        outputs = infer(tensor_input)
        predictions = next(iter(outputs.values()))
        
        # Apply softmax to get probabilities (assuming the model outputs logits, but if it outputs probabilities, softmax is safe if we don't apply it twice. Typically we apply softmax to be sure).
        # We'll apply softmax just in case. If the model already has softmax, applying it again will squash values, but let's assume raw logits.
        # Actually, let's check if the sum is close to 1 to avoid double softmax.
        preds_numpy = predictions.numpy()[0]
        if not np.isclose(np.sum(preds_numpy), 1.0, atol=1e-3):
            probabilities = tf.nn.softmax(predictions).numpy()[0]
        else:
            probabilities = preds_numpy

        # Get max confidence and predicted class
        predicted_label_index = int(np.argmax(probabilities))
        max_confidence = float(probabilities[predicted_label_index])
        
        class_probabilities = {labels[i]: float(probabilities[i]) for i in range(len(labels))}
        
        is_recognized = True
        predicted_label_name = labels[predicted_label_index]
        
        # Out-of-distribution handling
        if max_confidence < 0.5:
            is_recognized = False
            predicted_label_name = f"Unknown / Not a recognized skin disease among {', '.join(labels)}"

        return {
            "predicted_label_index": predicted_label_index,
            "predicted_label_name": predicted_label_name,
            "confidence": max_confidence,
            "is_recognized": is_recognized,
            "class_probabilities": class_probabilities
        }
        
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        raise
