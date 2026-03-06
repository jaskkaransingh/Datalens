# DataLens 🚀

**DataLens** is a high-performance, schema-agnostic data engineering and predictive visualization suite. Designed for professional data workflows, it provides tools for data cleaning, anomaly detection, real-time predictive modeling, and high-fidelity reporting.

---

## ✨ Key Features

- **Strategic Refiner**: Interactive data healing (Mean/Median/Mode), anomaly suppression, and automated dimension pruning.
- **Predictive Unity**: Real-time Linear Regression forecasting powered by Scikit-Learn with trend analysis and R² scoring.
- **Visualization Studio**: High-fidelity heatmaps, interactive spreadsheets, and dynamic analytics dashboards.
- **Export Hub**: Server-side generation of Master Excel Workbooks, production-ready CSVs, and JSON files.

---

## 🛠️ Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **Python**: v3.8 or higher ([Download](https://www.python.org/downloads/))
    - *Windows Users*: Ensure "Add Python to PATH" is checked during installation.

---

## 📦 Required Files for Setup

To run the application, the following configuration files are essential:

- `Frontend/package.json`: Manages Node.js dependencies for the user interface.
- `Frontend/api/requirements.txt`: Contains Python libraries for the backend engine.
- `start-datalens.bat`: Optimized startup script for Windows users.

---

## 🚀 Getting Started

### Method A: Automated Start (Windows)
The easiest way to boot the entire system is using the provided batch script:
1. Navigate to the `Datalens` root folder.
2. Double-click `start-datalens.bat`.
3. The script will install dependencies and launch both servers automatically.
4. Access the dashboard at: `http://localhost:5173`

### Method B: Manual Manual (Developer Mode)
If you prefer manual control via the terminal:

#### 1. Backend Setup
```bash
cd Frontend/api
pip install -r requirements.txt
python app.py
```
*Wait for: `Running on http://127.0.0.1:5000`*

#### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
*Wait for: `Local: http://localhost:5173/`*

---

## ⌨️ Command Reference

| Context | Command | Description |
| :--- | :--- | :--- |
| **Python** | `pip install -r requirements.txt` | Install backend dependencies |
| **Python** | `python app.py` | Start the Flask development server |
| **Node.js** | `npm install` | Install frontend dependencies |
| **Node.js** | `npm run dev` | Start the Vite development server |
| **Node.js** | `npm run build` | Build the application for production |

---

## 📂 Project Structure

```text
Datalens/
├── Backend/          # Core backend logic and services
├── Frontend/         # React Application
│   ├── api/          # Python API Engine (Flask)
│   ├── src/          # Source code (Components, Assets)
│   └── package.json  # Frontend configuration
├── .gitignore        # Git exclusion rules
├── README.md         # Project documentation
└── start-datalens.bat # Win-start script
```

---

## ❓ Troubleshooting

- **Python not found**: Re-install Python and ensure "Add to PATH" is selected.
- **Port Conflict**: If port 5173 or 5000 is in use, stop other services or change configuration in `vite.config.js` or `app.py`.
- **Module missing**: Run `npm install` or `pip install` again to ensure all packages are synchronized.

---
*Built with ❤️ for Data Engineering excellence.*
