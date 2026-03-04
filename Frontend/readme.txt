# DATALENS - SETUP & EXECUTION GUIDE (VS CODE TERMINAL)
# For users with ZERO coding knowledge

Welcome to DataLens! This guide will walk you through exactly how to get this application running using the VS Code Terminal.

====================================================
STEP 1: DOWNLOAD REQUIRED SOFTWARE (ONE-TIME ONLY)
====================================================
You only need to do this the very first time you ever run this project on your computer.

1. Download and Install Node.js
   - Go to: https://nodejs.org/en
   - Download the version that says "LTS" (Recommended for Most Users).
   - Run the installer and click "Next" through all the default options until it finishes.

2. Download and Install Python
   - Go to: https://www.python.org/downloads/
   - Download the latest version of Python.
   - Run the installer.
   - ***CRITICAL STEP***: On the very first screen of the Python installer, look at the bottom. Check the box that says "Add Python.exe to PATH" or "Add Python to environment variables". If you miss this, the app will not work!
   - Click "Install Now" and wait for it to finish.

====================================================
STEP 2: OPENING THE PROJECT IN VS CODE
====================================================
1. Open Visual Studio Code (VS Code).
2. Go to File -> Open Folder...
3. Select the main "Datalens" folder (the folder containing this readme).

====================================================
STEP 3: STARTING THE BACKEND (PYTHON API)
====================================================
We need to start the "brain" of the application first.

1. In VS Code, go to the top menu and click: Terminal -> New Terminal.
2. A terminal panel will open at the bottom of the screen.
3. Type the following command and press Enter to go into the API folder:
   cd Frontend/api

4. Type this command and press Enter to install the required Python libraries (this might take a minute):
   pip install -r requirements.txt

5. Type this command and press Enter to start the backend server:
   python app.py

You should see text saying "Running on http://127.0.0.1:5000". Leave this terminal tab open and running!

====================================================
STEP 4: STARTING THE FRONTEND (VISUAL INTERFACE)
====================================================
Now we need to start the visual part of the application.

1. Keep the first terminal running. Next to the word "Terminal" in the bottom panel, click the "+" icon (or the split screen icon) to open a SECOND terminal tab.
2. In this new terminal, type the following command and press Enter to go into the Frontend folder:
   cd Frontend

3. Type this command and press Enter to install the necessary visual components (this might take a minute):
   npm install

4. Type this command and press Enter to start the visual interface:
   npm run dev

5. You will see text saying "Local: http://localhost:5173/". 
6. Hold the "Ctrl" key on your keyboard and click that link (http://localhost:5173/), or simply open your web browser and type that link into the address bar.

====================================================
STEP 5: HOW TO CLOSE THE APPLICATION
====================================================
When you are done using the application:
1. Go to your VS Code terminals.
2. Click inside the terminal and press "Ctrl + C" on your keyboard. It might ask "Terminate batch job (Y/N)?", type Y and press Enter.
3. Do this for both terminal tabs.
4. You can now close VS Code.

Enjoy exploring your data!
