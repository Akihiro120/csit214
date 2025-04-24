#!/bin/bash
# ./seeder/entrypoint.sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Variables from environment (Docker Compose)
DB_HOST=$POSTGRES_HOST
DB_PORT=$POSTGRES_PORT
DB_USER=$POSTGRES_USER # Optional: wait-for-it doesn't strictly need user/pass

echo "Waiting for database at $DB_HOST:$DB_PORT..."

# Use wait-for-it.sh to wait for the database service to be available
# Timeout after 60 seconds. Execute the command after '--' only on success.
/app/wait-for-it.sh "$DB_HOST:$DB_PORT" -t 60 -- true

# Check if the wait-for-it script succeeded (exit code 0)
if [ $? -eq 0 ]; then
  echo "Database is up!"
  sleep 5 # Waits for 5 seconds
else
  echo "Database did not become available in time. Exiting."
  exit 1
fi

echo "Installing Python dependencies..."
pip3 install --no-cache-dir -r /app/requirements.txt

echo "Running Python flight seed script..."
python3 /app/seed_data.py

echo "Running Python booking seed script..."
python3 /app/seed_booking_data.py

echo "Seeding process finished."
# Container will exit after this script finishes