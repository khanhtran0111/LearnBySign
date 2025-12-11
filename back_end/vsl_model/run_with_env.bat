@echo off
REM Activate vsl_env and run main.py

REM Check if vsl_env exists
if not exist "vsl_env\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found!
    echo Please run setup_env.bat first to create the environment.
    exit /b 1
)

REM Activate environment
call vsl_env\Scripts\activate.bat

REM Run Python server
python main.py
