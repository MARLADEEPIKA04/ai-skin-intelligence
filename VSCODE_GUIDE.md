# 🛠️ AI Skin Intelligence — VS Code Development & Debugging Guide

This guide provides the exact steps, prompts, and shortcut keys to run, debug, and test the **AI Skin Intelligence & Personalized Skincare Planner** inside Visual Studio Code.

---

## 🚀 Quick Start in VS Code (3 Steps)

### Step 1: Open the Project in VS Code
1. Launch Visual Studio Code.
2. Go to **File** > **Open Folder...** (or press `Ctrl+K Ctrl+O`).
3. Select the project directory:
   ```text
   C:\Users\janak\.gemini\antigravity\scratch\ai-skin-intelligence
   ```

### Step 2: Select the Python Virtual Environment
1. Press `Ctrl+Shift+P` to open the Command Palette.
2. Type `Python: Select Interpreter` and press `Enter`.
3. Choose the virtual environment:
   ```text
   .\backend\venv\Scripts\python.exe
   ```

---

## 🐞 Running & Debugging (F5 Key)

The project includes pre-configured launch tasks in [`.vscode/launch.json`](.vscode/launch.json).

### Option A: Run & Debug with F5 (One-Click)
1. Open the **Run and Debug** view (`Ctrl+Shift+D`).
2. In the dropdown at the top, select:
   - **`🚀 Backend: FastAPI (Debug)`** — Runs backend on `http://127.0.0.1:8000` with live reload and active breakpoints.
   - **`🧪 Backend: Run Pytest Suite`** — Runs all 10 automated test suites with debugger support.
   - **`⚡ Full Stack: FastAPI + Chrome`** — Simultaneously launches FastAPI and attaches the Chrome debugger to the frontend on `http://localhost:5173`.
3. Press **`F5`** to start debugging.

---

## ⚡ Running via VS Code Tasks (`Ctrl+Shift+B`)

Pre-configured tasks are available in [`.vscode/tasks.json`](.vscode/tasks.json):

1. Press `Ctrl+Shift+P` and choose **Tasks: Run Task** (or `Terminal` > `Run Task...`).
2. Choose from the available tasks:
   - **`Start FastAPI Backend`** — Launches Uvicorn on port `8000`.
   - **`Start Vite Frontend`** — Launches Vite dev server on port `5173`.
   - **`Run Backend Pytest Suite`** — Runs full automated test suite.
   - **`Build Frontend Production`** — Compiles production bundle in `frontend/dist/`.
   - **`Docker: Start All Services`** — Spawns PostgreSQL + Backend + Frontend containers.
   - **`Docker: Stop All Services`** — Shuts down containers cleanly.

---

## 💻 Manual Terminal Commands in VS Code

You can also run commands directly in the VS Code Integrated Terminal (``Ctrl+` ``):

### Terminal 1: Backend (FastAPI)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
- API is live at: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- ReDoc Docs: `http://127.0.0.1:8000/redoc`

### Terminal 2: Frontend (Vite + React)
```powershell
cd frontend
npm run dev
```
- Web Application is live at: `http://localhost:5173`

### Terminal 3: Automated Pytest Testing
```powershell
cd backend
$env:PYTHONPATH="."
.\venv\Scripts\pytest -v tests
```

---

## 🐳 Docker Deployment from VS Code Terminal

To launch the full production stack including PostgreSQL:

```powershell
# From the project root directory
docker compose up --build -d
```

- **Frontend Application**: `http://localhost:80` or `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL Database**: `localhost:5432`

To shut down:
```powershell
docker compose down
```

---

## 🔑 Pre-Seeded Clinical Multi-Role Accounts

| Role | Email | Password | Primary Dashboard |
| :--- | :--- | :--- | :--- |
| **Client / Patient** | `alex@demo.com` | `password123` | Client Skincare Dashboard |
| **Dermatologist** | `dr.chen@demo.com` | `password123` | Doctor Clinical Triage Hub |
| **Skincare Consultant** | `maya.consultant@demo.com` | `password123` | Consultant Routine Studio |
| **Clinical Admin** | `admin@demo.com` | `password123` | Executive Analytics Dashboard |

---

## 💡 Recommended VS Code Extensions
- **Python** (`ms-python.python`)
- **Pylance** (`ms-python.vscode-pylance`)
- **Python Debugger** (`ms-python.debugpy`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Docker** (`ms-azuretools.vscode-docker`)
