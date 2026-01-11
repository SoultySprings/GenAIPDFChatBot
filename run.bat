@echo off
REM Try to run the PowerShell script
echo Launching Project via PowerShell...
powershell -NoProfile -ExecutionPolicy Bypass -File "run_project.ps1"
if %errorlevel% neq 0 (
    echo Failed to run PowerShell script.
    pause
)
