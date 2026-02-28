@echo off
REM Tech Turf - Quick Start Script (Windows CMD)
REM This script starts the backend server

echo ==================================
echo Tech Turf - India Edition
echo Quick Start Script
echo ==================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Node.js not found. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo √ Node.js found
echo.

REM Check if npm is installed
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X npm not found. Please install npm.
    pause
    exit /b 1
)
echo √ npm found
echo.

REM Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo √ Backend dependencies installed
) else (
    echo √ Backend dependencies already installed
)
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo X .env file not found in backend folder
    echo Please ensure backend/.env file exists with proper configuration
    pause
    exit /b 1
)
echo √ .env file found
echo.

echo ==================================
echo Starting Tech Turf Backend...
echo ==================================
echo.
echo Backend starting on http://localhost:5000
echo.
echo IMPORTANT: To access the frontend:
echo 1. Open another terminal/command prompt
echo 2. Navigate to the 'frontend' folder
echo 3. Open 'index.html' with Live Server in VS Code
echo    OR run: npx http-server -p 3000
echo 4. Access http://localhost:3000 in your browser
echo.
echo Press Ctrl+C to stop the server
echo.

cd backend
npm start

cd ..
