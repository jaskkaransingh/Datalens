# DataLens Industrial Workstation

DataLens is a professional, schema-agnostic data engineering and predictive visualization suite. It allows you to ingest any CSV dataset, interactively heal missing fragments, suppress anomalies, run Scikit-Learn linear regression forecasts, and extract high-fidelity production workbooks (Master Excel, CSV, JSON).

## Core Features
*   **Strategic Refiner:** Heal missing data (Mean/Median/Mode), clip numerical anomalies based on standard deviations, and prune unnecessary dimensions without writing code.
*   **Predictive Unity:** Run real-time Scikit-Learn Linear Regression forecasting directly in the browser, complete with trend lines and confidence scoring (R²).
*   **Visualization Studio:** Instantly generate interactive System Health Heatmaps, Data Spreadsheets, and high-fidelity analytics.
*   **Export Hub:** Extract your processed data via server-side generation into Master Excel Workbooks (containing both data and analytical summaries), Production CSVs, and System JSON files.

---

## 🚀 Setup & Execution Guide

There are two ways to run this project. You can either use the **Automated 1-Click Script** (easiest for Windows users) or manually start it via the **Visual Studio Code Terminal** (best for developers and Mac/Linux users).

### Prerequisites (For both methods)
You must install these two tools before running the application:

1.  **Node.js (v18 or higher):** Download the LTS version from [nodejs.org](https://nodejs.org/en).
2.  **Python (v3.8 or higher):** Download from [python.org](https://www.python.org/downloads/).
    *   ⚠️ **CRITICAL (WINDOWS USERS):** On the very first screen of the Python installer, you **MUST** check the box at the bottom that says **"Add python.exe to PATH"**. If you miss this, the application will not be able to find Python!

---

### Method A: Automated 1-Click Start (Windows Only)
We have provided an automated batch script that checks your system, installs all background libraries, and starts the servers for you.

1.  Open the main `Datalens` folder in File Explorer.
2.  Double-click the **`start-datalens.bat`** file.
3.  Two terminal windows will pop up. They will automatically sync the `pip` and `npm` libraries and boot up the servers.
4.  Wait about 10 seconds. Your default web browser will automatically open the dashboard at `http://localhost:5173`.
5.  *Note: Leave the two black terminal windows running in the background while you use the application. When you are done, close your browser and close those windows.*

---

### Method B: Manual Start via VS Code (Cross-Platform)
If you prefer to see the terminal processes within your editor, follow these steps:

#### Step 1: Start the Python Backend Engine
1.  Open the main `Datalens` folder in Visual Studio Code.
2.  Open a new terminal at the bottom of the screen (`Terminal` -> `New Terminal`).
3.  Navigate to the API folder:
    ```bash
    cd Frontend/api
    ```
4.  Install the mathematical Python libraries:
    ```bash
    pip install -r requirements.txt
    ```
5.  Start the Python server:
    ```bash
    python app.py
    ```
    *(Wait until it says "Running on http://127.0.0.1:5000", and leave this terminal tab open!)*

#### Step 2: Start the React Visual Shell
1.  Click the **"+"** icon (or split-screen icon) in the VS Code terminal panel to open a **Second Terminal Tab**.
2.  Navigate to the Frontend folder:
    ```bash
    cd Frontend
    ```
3.  Install the Node packages:
    ```bash
    npm install
    ```
4.  Boot up the user interface:
    ```bash
    npm run dev
    ```
5.  You will see a link indicating `Local: http://localhost:5173/`. Hold `Ctrl` (or `Cmd` on Mac) and click that link to open the application in your browser.

---

## Troubleshooting

*   **"Python/pip is not recognized as an internal or external command"**
    You likely forgot to check the "Add Python to PATH" box during installation. Uninstall Python, download the installer, and run it again, making sure to check that box.
*   **"npm is not recognized"**
    Node.js did not install correctly or your computer hasn't registered the new path. Try restarting Visual Studio Code or your entire computer.
*   **Browser opens with "Site cannot be reached"**
    The servers are still starting up. Wait 5-10 seconds and simply refresh the web page.
