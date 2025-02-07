#!/bin/bash

echo "Stopping frontend and backend services..."

kill_process_on_port() {
    local port=$1
    local pid=$(netstat -ano | grep ":$port" | awk '{print $5}')

    if [ ! -z "$pid" ]; then
        echo "Stopping process on port $port (PID: $pid)..."
        taskkill //F //PID $pid
    else
        echo "No active process found on port $port."
    fi
}

kill_process_on_port 5173  # Frontend
kill_process_on_port 3000  # Backend

echo "All services stopped successfully."

exit 0
