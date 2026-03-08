# DataLens 🚀

**DataLens** is a premium, high-performance data engineering and immersive visualization platform. It combines professional-grade data cleaning, logical validation, and predictive analytics with a live **RAG (Retrieval-Augmented Generation)** chatbot that understands every change you make to your dataset in real-time.

---

## ✨ Key Features

- **Live RAG Context**: Integrated AI assistant that tracks your data cleaning history, column types, and visualization axes to provide intelligent, contextual insights.
- **Granular Data Healing**: 
  - **Clean**: Move beyond bulk fixes. Use the "Custom" rail to manually correct specific rows of missing/NaN data.
  - **Type Validation**: Detect mismatches (Email, Integer, Date) and perform bulk or individual corrections.
  - **Logical Validation**: Define Min/Max constraints and resolve rows that break your business logic.
- **Micro-Animation UI**: A sleek, dark-themed interface built with glassmorphism and smooth transitions for a premium software feel.
- **Enterprise View**: An Excel-like spreadsheet with live cell editing and instant background synchronization.
- **Visualization Hub**: Generate Bar, Line, and Scatter charts with automated trend analysis logged to the AI engine.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide-React (Icons), Vanilla CSS (Custom Design System).
- **Backend**: FastAPI (Python), Pandas (Data Processing), NumPy.
- **AI/RAG**: OpenRouter API (GPT-4o Mini), Sentence-Transformers (Local Embeddings), VectorDB (Custom JSON Metadata Store).

---

## 🚀 Getting Started

To run DataLens locally, you need to start the Backend and Frontend servers simultaneously.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.9+)

### 2. Backend Installation & Run
```bash
# Navigate to Backend folder
cd Backend

# Install dependencies
python -m pip install -r requirements.txt

# Start the server
python main.py
```
*The backend will be available at `http://localhost:5000`.*

### 3. Frontend Installation & Run
```bash
# Navigate to Frontend folder
cd Frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```
*The application will open at `http://localhost:5173`.*

---

## 🔑 API Configuration (OpenRouter)

The RAG Chatbot requires an API key from [OpenRouter](https://openrouter.ai/).

1. Create a file named `.env` in the `Backend/` directory.
2. Add your key:
   ```env
   OPENROUTER_API_KEY=your_key_here
   ```
3. Restart the Python backend to apply the key.

*Note: The system is optimized for `gpt-4o-mini`. Ensure your OpenRouter account has credits.*

---

## 📂 Project Structure

```text
Datalens/
├── Backend/               # Python FastAPI Services
│   ├── rag/               # VectorDB & LLM Logic
│   ├── routes/            # API Endpoints (Clean, Upload, Visualize)
│   ├── services/          # Core Business Logic
│   └── .env               # API Configuration (Git Ignored)
├── Frontend/              # React Application
│   ├── src/
│   │   ├── components/    # UI Components (Sheet, Panels, Chat)
│   │   └── App.jsx        # Main Application Logic
│   └── index.css          # Premium Design System
├── requirements.txt       # Global Requirements
└── README.md              # Documentation
```

---

## 🏗️ Deployment to GitHub

When uploading this project to GitHub, ensure the following are included:
- All source files in `Backend/` and `Frontend/`.
- The `index.css` file (contains the entire design system).
- `requirements.txt` and `package.json`.

**Mirroring Security**: Never upload your `.env` file containing your API key.

---

## ❓ Troubleshooting

- **"TypeError: Failed to fetch"**: Check if the Python backend is running.
- **"Afford 400 tokens / Requested 500"**: OpenRouter credit limit reached. The system is currently set to a 300-token limit in `llm.py` to maximize availability.
- **Excel View doesn't show data**: Ensure the CSV uploaded is a valid comma-separated file.

---
*Built for Data Scientists and Engineers who demand a premium UI for data preparation.*
