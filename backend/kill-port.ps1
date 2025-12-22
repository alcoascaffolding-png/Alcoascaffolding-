# PowerShell script to kill process on port 5000
# Usage: .\kill-port.ps1 [port]
param(
    [int]$Port = 5000
)

Write-Host "Checking for processes on port $Port..." -ForegroundColor Yellow

$processes = netstat -ano | findstr ":$Port"

if ($processes) {
    $pids = $processes | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $matches[1]
        }
    } | Select-Object -Unique

    foreach ($pid in $pids) {
        Write-Host "Killing process with PID: $pid" -ForegroundColor Red
        taskkill /PID $pid /F | Out-Null
    }
    
    Write-Host "Port $Port is now free!" -ForegroundColor Green
} else {
    Write-Host "No process found on port $Port" -ForegroundColor Green
}

