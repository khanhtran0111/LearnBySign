@echo off
REM ============================================
REM Setup VSL Model Environment
REM Tạo môi trường Python riêng cho VSL models
REM ============================================

echo ============================================
echo    VSL Model Environment Setup
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYVER=%%i
echo [INFO] Detected Python version: %PYVER%
echo [INFO] MediaPipe requires Python 3.8-3.12 (not 3.13+)
echo.

echo [1/4] Creating virtual environment...
if exist "vsl_env" (
    echo      Virtual environment already exists, skipping...
) else (
    python -m venv vsl_env
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
)

echo [2/4] Activating virtual environment...
call vsl_env\Scripts\activate.bat

echo [3/4] Upgrading pip...
python -m pip install --upgrade pip

echo [4/4] Installing dependencies...
pip install -r requirements.txt

echo.
echo ============================================
echo    Setup Complete!
echo ============================================
echo.
echo To activate the environment, run:
echo    vsl_env\Scripts\activate.bat
echo.
echo To start the API server, run:
echo    python main.py
echo.
echo Or use the start script:
echo    start_server.bat
echo ============================================

pause
