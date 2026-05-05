# AllerCheck: Skin Disease & Allergy Classification

AllerCheck is a full‑stack application that classifies common skin conditions  
(**Acne, Carcinoma, Eczema, Keratosis, Milia, Rosacea**) using a TensorFlow CNN model  
and provides AI‑generated explanations via the **Gemini API**.

This project was built as a **3rd year B.E. mini project** to explore end‑to‑end
deployment of machine learning models with a modern web UI and AI assistant integration.

---

## Project Structure

- `backend/` – FastAPI application for:
  - Model inference (TensorFlow SavedModel)
  - Gemini API integration for explanations
- `frontend/` – React (Vite) + Tailwind CSS user interface
- `docker-compose.yml` – Runs backend and frontend together with one command

---

## Prerequisites

- **Docker & Docker Compose**
- **Node.js** (only if you want to run the frontend locally without Docker)
- **Python 3.11** (only if you want to run the backend locally without Docker)
- **Gemini API key** with access to the Gemini model you’re using

---

## 1. Model Setup

You need to provide your trained **EfficientNetB0** `SavedModel` for skin‑condition classification.

Place your model folder inside:

```text
backend/models/skin_conditions_classifier
```

So the directory structure looks like:

```text
backend/
└── models/
    ├── labels.json                # Class names: Acne, Carcinoma, Eczema, Keratosis, Milia, Rosacea
    └── skin_conditions_classifier/
        ├── saved_model.pb
        └── variables/
```

> `labels.json` is already provided.  
> Ensure the class order used during training matches the order in this file.

---

## 2. Environment Variables

The backend uses `GEMINI_API_KEY` to call the Gemini API.

### Option A – Using `.env` with Docker Compose (recommended)

Create a file named `.env` in the **project root**:

```env
GEMINI_API_KEY=your_api_key_here
```

Docker Compose automatically loads this and passes it to the backend service.

### Option B – Export manually

**macOS / Linux**

```bash
export GEMINI_API_KEY=your_api_key_here
```

**Windows PowerShell**

```powershell
$env:GEMINI_API_KEY = "your_api_key_here"
```

---

## 3. Running with Docker Compose (Recommended)

From the **project root**:

```bash
docker-compose up --build
```

After the build completes:

- Frontend: <http://localhost:3000>  
- Backend API: <http://localhost:8000>  
- API docs (Swagger / OpenAPI): <http://localhost:8000/docs>

To stop containers:

```bash
docker-compose down
```

---

## 4. Running Locally Without Docker

### 4.1 Backend (FastAPI + TensorFlow)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# macOS / Linux
source venv/bin/activate
# Windows
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set Gemini API key (example for macOS/Linux)
export GEMINI_API_KEY=your_api_key_here

# Run FastAPI backend
uvicorn main:app --reload --port 8000
```

Backend will be available at:

> <http://localhost:8000>

---

### 4.2 Frontend (React + Vite + Tailwind)

```bash
cd frontend

# Install dependencies
npm install

# Point frontend to backend (example for macOS/Linux)
export VITE_API_URL=http://localhost:8000   # or set in .env.local

# Run dev server
npm run dev
```

Frontend dev server will be available at:

> <http://localhost:3000>

---

## 5. Testing & Verification

### 5.1 Backend Health Check

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status": "ok"}
```

---

### 5.2 Analyze Endpoint (Direct API Test)

```bash
curl -X POST http://localhost:8000/analyze \
  -F "image=@/path/to/test/image.jpg"
```

Expected JSON shape (example):

```json
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
```

---

## 6. Common Issues & Troubleshooting

### Frontend shows “NetworkError” or cannot reach backend

1. Check containers:

   ```bash
   docker-compose ps
   ```

   Both `allercheck-backend` and `allercheck-frontend` should be in state `Up`.

2. Verify backend health:

   ```bash
   curl http://localhost:8000/health
   ```

3. Confirm the frontend is pointing to the correct backend URL:

   - `VITE_API_URL` or the base URL in `src/utils/api.ts` should be `http://localhost:8000`.

---

### Backend crashes on startup

1. Inspect logs:

   ```bash
   docker-compose logs backend
   ```

2. Verify:

   - `backend/models/skin_conditions_classifier` exists and contains a valid TensorFlow SavedModel.
   - `backend/models/labels.json` is present and matches your training classes.
   - `GEMINI_API_KEY` is set and valid.

---

### Gemini-related errors

- **HTTP 401 / 403**:
  - API key is invalid or not authorized for Gemini.
- If Gemini calls fail, the backend may fall back to a generic explanation depending on your implementation.  
  Check backend logs for the exact error.

---

## 7. Project Context – B.E. 3rd Year Mini Project

This application was developed as a **3rd year B.E. mini project** with the following learning goals:

- Train and export an **EfficientNetB0** CNN for multi‑class skin disease classification.
- Integrate a TensorFlow model into a **FastAPI** backend for real‑time inference.
- Build a modern **React + Vite + Tailwind** frontend with:
  - Image upload
  - Camera capture
  - Responsive dashboard UI
- Use the **Gemini API** to generate:
  - User‑friendly condition explanations
  - Safety disclaimers
- Containerize the whole stack with **Docker Compose** for easy local deployment and demos.

---

## 8. Disclaimer

This application is for **educational and demonstrational purposes only**.

It does **not** provide medical diagnoses, treatment recommendations, or professional advice.

Always consult a qualified healthcare professional or dermatologist for any concerns related to your health or skin conditions.
