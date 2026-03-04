# DataLens Industrial Workstation

DataLens is a professional, schema-agnostic data engineering and predictive visualization suite. It allows you to ingest any CSV dataset, interactively heal missing fragments, suppress anomalies, run Scikit-Learn linear regression forecasts, and extract high-fidelity production workbooks (Master Excel, CSV, JSON).

##Setup & Execution (Windows)

We have created an automated initialization protocol that handles everything—from installing background mathematical libraries to booting up the visual interface.

### Prerequisites

You must have these two fundamental engines installed on your computer before running the script:

1. **Python (version 3.8 or higher)**
   - Download from [python.org](https://www.python.org/downloads/)
   - **CRITICAL**: During the Python installation, you **must check the box that says "Add Python to PATH"** at the bottom of the installer window.
2. **Node.js (version 18 or higher)**
   - Download the recommended "LTS" version from [nodejs.org](https://nodejs.org/en)

### How to Start the Application

1. Navigate to this main `Datalens` folder (the folder containing this Readme).
2. Double-click the **`start-datalens.bat`** script.
3. The script will automatically:
   - Detect your Python and Node.js installations.
   - Synchronize all Python mathematical libraries (`pandas`, `scikit-learn`, `flask`, `openpyxl`).
   - Synchronize the React Visual Shell dependencies.
   - Boot up the core backend engine and the visual shell in two separate console windows.
4. Your default web browser will automatically open the application at `http://localhost:5173`.

*Note: Keep the two black terminal windows running in the background while using DataLens. When you are finished, simply close the browser and close those terminal windows to deactivate the system.*

## Architecture Overview

- **Frontend Shell**: Built on React and Vite for a 0-latency cockpit interface. Located in `/Frontend/src`.
- **Backend Inference API**: Built on Python Flask, Pandas, and Scikit-Learn. Located in `/Frontend/api`.
- **Data Protocols**: Operates 100% locally in-memory. Zero external cloud relays, ensuring complete data privacy.
