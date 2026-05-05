AllerCheck: Skin Disease & Allergy Classification
A full-stack application to classify common skin conditions (Acne, Carcinoma, Eczema, Keratosis, Milia, Rosacea) using a TensorFlow CNN model and to provide AI‑generated explanations via the Gemini API.

This project was built as a 3rd year B.E. mini project to explore end‑to‑end deployment of machine learning models with a modern web UI and AI assistant integration.

Project Structure
/backend: FastAPI application for model inference and Gemini API interaction.

/frontend: React (Vite) application with Tailwind CSS for the user interface.

docker-compose.yml: For easy full‑stack deployment (backend + frontend).

Prerequisites
Docker and Docker Compose

Node.js (if running the frontend locally outside Docker)

Python 3.11 (if running the backend locally outside Docker)

A valid Gemini API key

1. Model Setup
You need to provide your trained EfficientNetB0 SavedModel for skin conditions.

Place your model folder inside backend/models/skin_conditions_classifier.

Directory structure:

text
backend/
└── models/
    ├── labels.json              # class names: Acne, Carcinoma, Eczema, Keratosis, Milia, Rosacea
    └── skin_conditions_classifier/
        ├── saved_model.pb
        └── variables/
Note: labels.json is already provided. Make sure the order of classes used during training matches the labels file.

2. Environment Variables
The backend uses a Gemini API key for explanations.

Option A – Using .env with Docker Compose (recommended)
Create a .env file in the project root:

text
GEMINI_API_KEY=your_api_key_here
Docker Compose will automatically inject this into the backend container.

Option B – Export manually
On macOS/Linux:

bash
export GEMINI_API_KEY=your_api_key_here
On Windows PowerShell:

powershell
$env:GEMINI_API_KEY="your_api_key_here"
3. Running with Docker Compose (Recommended)
From the project root:

bash
docker-compose up --build
After build:

Frontend: http://localhost:3000

Backend API: http://localhost:8000

API docs (OpenAPI/Swagger): http://localhost:8000/docs

To stop:

bash
docker-compose down
4. Running Locally Without Docker
4.1 Backend
bash
cd backend
python -m venv venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

pip install -r requirements.txt

# Set Gemini API key
export GEMINI_API_KEY=your_api_key_here  # or use PowerShell syntax on Windows

# Run FastAPI backend
uvicorn main:app --reload --port 8000
Backend will be available at http://localhost:8000.

4.2 Frontend
bash
cd frontend
npm install

# Point frontend to backend
export VITE_API_URL=http://localhost:8000  # or set in .env.local

npm run dev
Frontend dev server will be available at http://localhost:3000.

5. Testing & Verification
5.1 Backend Health Check
bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
5.2 Analyze Endpoint (Direct)
bash
curl -X POST http://localhost:8000/analyze \
  -F "image=@/path/to/test/image.jpg"
Expected JSON response (example shape):

json
{
  "predicted_label_index": 2,
  "predicted_label_name": "Eczema",
  "confidence": 0.78,
  "is_recognized": true,
  "class_probabilities": {
    "Acne": 0.05,
    "Carcinoma": 0.02,
    "Eczema": 0.78,
    "Keratosis": 0.04,
    "Milia": 0.03,
    "Rosacea": 0.08
  },
  "explanation": "AI-generated Gemini explanation here...",
  "disclaimer": "This app is for educational purposes only and does not provide a medical diagnosis. Please consult a qualified doctor."
}
6. Common Issues & Troubleshooting
Frontend shows “NetworkError” or cannot reach backend
Check containers:

bash
docker-compose ps
Ensure both allercheck-backend and allercheck-frontend are Up.

Verify backend health:

bash
curl http://localhost:8000/health
Ensure VITE_API_URL (or frontend api.ts base URL) points to http://localhost:8000.

Backend crashes on startup
Check backend logs:

bash
docker-compose logs backend
Verify:

backend/models/skin_conditions_classifier exists and contains a valid TensorFlow SavedModel.

backend/models/labels.json is present and matches the trained classes.

GEMINI_API_KEY is set and valid.

Gemini-related errors
401 / 403 errors usually mean:

Invalid API key.

Key not enabled for the Gemini API.

If Gemini fails, the backend may fall back to a generic explanation depending on implementation. Check logs for details.

7. Project Context (B.E. 3rd Year Mini Project)
This application was developed as a 3rd year B.E. mini project with the following learning goals:

Training and exporting a CNN (EfficientNetB0) for multi‑class skin condition classification.

Integrating a TensorFlow model into a FastAPI backend for real‑time inference.

Building a modern React + Vite + Tailwind UI with camera capture and image upload.

Using the Gemini API to generate user‑friendly explanations and safety disclaimers.

Containerizing the full stack with Docker Compose for easy local deployment.

8. Disclaimer
This application is for educational and demonstrational purposes only.
It does not provide medical diagnoses or treatment recommendations.

Always consult a qualified healthcare professional or dermatologist for any concerns related to your health or skin conditions.
