@echo off
REM Backend Setup Script for Spamurai (Windows)

echo 🥷 Setting up Spamurai Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.9+ first.
    exit /b 1
)

echo ✅ Found Python
python --version

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️  Upgrading pip...
python -m pip install --upgrade pip --quiet

REM Install requirements
echo 📥 Installing requirements...
pip install -r requirements.txt

echo.
echo ✅ Backend setup complete!
echo.
echo To start the server, run:
echo   venv\Scripts\activate
echo   python app.py
echo.
echo Or simply run: python app.py (it will auto-install if needed)

pause

