$currentDir = Get-Location
$backendDir = Join-Path $currentDir "backend"
$frontendDir = Join-Path $currentDir "frontend"
$venvActivate = Join-Path $currentDir "venv\Scripts\activate.ps1"

Write-Host "Starting Smart Support Chat Platform..." -ForegroundColor Cyan

# 1. Start Backend
Write-Host "Starting Backend (Headless)..." -ForegroundColor Green
$backendProcess = Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy Bypass", "-Command", "& { Set-Location '$backendDir'; . '$venvActivate'; uvicorn main:app --reload --port 8000 > ../backend.log 2>&1 }" -PassThru -WindowStyle Hidden

# 2. Start Frontend
Write-Host "Starting Frontend (Headless)..." -ForegroundColor Green
# Start frontend as a hidden process (no window)
$frontendProcess = Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy Bypass", "-Command", "& { Set-Location '$frontendDir'; npm run dev > ../frontend.log 2>&1 }" -PassThru -WindowStyle Hidden

# 3. Wait/Open Browser
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$url = "http://localhost:5173"
Write-Host "Opening $url" -ForegroundColor Cyan
Start-Process $url

Write-Host "Services are running in the background." -ForegroundColor White
Write-Host " Backend PID: $($backendProcess.Id)" -ForegroundColor Gray
Write-Host " Frontend PID: $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host "Press any key to STOP all services and exit..." -ForegroundColor Red

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
Stop-Process -Name "uvicorn" -ErrorAction SilentlyContinue
Stop-Process -Name "node" -ErrorAction SilentlyContinue

Write-Host "Stopped." -ForegroundColor Red
