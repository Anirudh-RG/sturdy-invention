#!/bin/bash

echo "Stopping frontend and backend services..."

# Function to kill processes running on a specific port
kill_process_on_port() {
    local port=$1
    local pid=$(lsof -ti:$port)

    if [ ! -z "$pid" ]; then
        echo "Stopping process on port $port (PID: $pid)..."
        kill -9 $pid
    else
        echo "No active process found on port $port."
    fi
}

kill_process_on_port 5173  # Frontend
kill_process_on_port 3000  # Backend

echo "All services stopped successfully."

# Ensure script exits cleanly
exit 0
