#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r backend/requirements.txt

# Install Piper for Linux (or whatever OS this runs on)
python backend/install_piper.py
