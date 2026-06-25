@echo off
title NexusComm - School Automation Portal
echo ==================================================
echo NexusComm: Installing dependencies and running checks...
echo ==================================================
echo.

cd backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed. Please ensure Node.js is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==================================================
echo Running Programmatic Integration Tests...
echo ==================================================
echo.

cd ..
node tests/integration.test.js
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Integration tests failed. Exiting startup.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==================================================
echo Launching Application Server...
echo ==================================================
echo.

cd backend
echo Server booting on http://localhost:3000
echo Press Ctrl+C to terminate server execution.
node server.js
pause
