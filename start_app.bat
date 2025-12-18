@echo off
echo Starting Synapse Application...

echo Starting Backend...
start "Synapse Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload"

echo Starting Frontend...
start "Synapse Frontend" cmd /k "cd frontend && npm run dev"

echo Backend and Frontend launched in new windows.
pause
