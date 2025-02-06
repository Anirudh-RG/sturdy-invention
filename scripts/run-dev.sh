#!/bin/bash

echo "Starting backend..."
cd backend && npm run dev &  
BACKEND_PID=$!
echo "Started backend (PID: $BACKEND_PID)"

echo "Starting frontend..."
cd frontend && npm run dev &  
FRONTEND_PID=$!
echo "Started frontend (PID: $FRONTEND_PID)"
