#!/bin/bash

# Define the ports to check
PORTS=(3000 5173)

for PORT in "${PORTS[@]}"; do
    # Find the PID of the process using the port
    PID=$(lsof -t -i :$PORT)
    
    if [ -n "$PID" ]; then
        echo "Killing process on port $PORT (PID: $PID)"
        kill -9 $PID
    else
        echo "No process found on port $PORT"
    fi
done

echo "Done!"
exit 0
