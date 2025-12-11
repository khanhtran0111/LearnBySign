@echo off
REM ============================================
REM Start VSL Model API Server
REM ============================================

echo Starting VSL Model API Server...

REM Activate virtual environment
if exist "vsl_env\Scripts\activate.bat" (
    call vsl_env\Scripts\activate.bat
    echo [OK] Virtual environment activated
) else (
    echo [WARNING] Virtual environment not found. Run setup_env.bat first.
    echo [WARNING] Using system Python instead...
)

REM Start FastAPI server
echo [INFO] Starting server on http://localhost:8000
echo [INFO] API Docs: http://localhost:8000/docs
echo [INFO] Press Ctrl+C to stop
echo.

python main.py
