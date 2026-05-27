#!/bin/bash
# Quick run script for Spamurai backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Use python3 (works on macOS)
python3 app.py

