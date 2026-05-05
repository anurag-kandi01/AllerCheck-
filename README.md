# Smart Skin Conditions Analyzer

A full-stack application to classify skin conditions (Acne, Carcinoma, Eczema, Keratosis, Milia, Rosacea) using a TensorFlow model and provide AI-generated explanations via the Gemini API.

## Project Structure

- `/backend`: FastAPI application for inference and Gemini API interaction.
- `/frontend`: React (Vite) application with Tailwind CSS for the user interface.
- `docker-compose.yml`: For easy full-stack deployment.

## Prerequisites

- Docker and Docker Compose
- Node.js (if running frontend locally outside Docker)
- Python 3.11 (if running backend locally outside Docker)
- A Gemini API Key

## Setup Instructions

### 1. Model Setup

You need to provide your trained EfficientNetB0 `SavedModel`.
Place your model folder inside `backend/models/skin_conditions_classifier`.

The directory structure should look like this:
```
backend/
└── models/
    ├── labels.json (already provided)
    └── skin_conditions_classifier/
        ├── saved_model.pb
        └── variables/
```

### 2. Environment Variables

You need to provide your Gemini API key. If using Docker Compose, you can either create a `.env` file at the root or pass it when running:

```bash
export GEMINI_API_KEY=your_api_key_here
```

### 3. Running with Docker Compose (Recommended)

From the root directory, run:

```bash
docker-compose up --build
```

- Frontend will be available at `http://localhost:3000`
- Backend API will be available at `http://localhost:8000` (docs at `http://localhost:8000/docs`)

### 4. Running Locally (Without Docker)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
export GEMINI_API_KEY=your_api_key_here
uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
export VITE_API_URL=http://localhost:8000
npm run dev
```

## Testing & Verification

Once the stack is running, you can verify the backend is healthy:
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

You can test the prediction endpoint directly without the frontend:
```bash
curl -X POST http://localhost:8000/analyze -F "image=@/path/to/test/image.jpg"
# Expected: JSON response with prediction, confidence, and Gemini explanation
```

### Troubleshooting
- **NetworkError in frontend:** Ensure the backend container is running (`docker-compose ps`) and listening on port 8000.
- **Backend crashes on startup:** Check backend logs (`docker-compose logs backend`). Ensure the `models` volume has the correct permissions and the TensorFlow model is formatted correctly.

## Disclaimer
This application is for educational and demonstrational purposes only. It does not provide medical diagnoses. Always consult a qualified healthcare professional.
