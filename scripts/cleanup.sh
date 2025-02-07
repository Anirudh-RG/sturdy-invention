#!/bin/bash

echo "Stopping frontend and backend services..."

kill_process_on_port() {
    local port=$1
    echo "Checking for processes on port $port..."
    
    # Use PowerShell to find and kill the process in one go
    powershell.exe -Command "
        Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess |
        ForEach-Object { Stop-Process -Id \$_ -Force -ErrorAction SilentlyContinue }
    "

    echo "Processes on port $port stopped."
}

kill_process_on_port 5173  # Frontend
kill_process_on_port 3000  # Backend

echo "All services stopped successfully."

exit 0
