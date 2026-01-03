#!/bin/bash

# Usage: ./scan.sh <relative_path_to_project> <sonar_token>
# Example: ./scan.sh src/versions/v.2/inventory_full_version sqp_...

if [ -z "$1" ]; then
  echo "Usage: ./scan.sh <relative_path_to_project> [sonar_token]"
  echo "Example: ./scan.sh src/versions/v.2/inventory_full_version my_token"
  exit 1
fi

PROJECT_PATH=$1
PROJECT_NAME=$(basename "$PROJECT_PATH")
# Replace slashes with underscores for a unique key if needed, or just use basename
PROJECT_KEY="project_${PROJECT_NAME}"
TOKEN=${2:-admin} # Default to admin if not provided (will likely fail if password changed)
PASSWORD=${3:-admin}

echo "Scanning $PROJECT_PATH with key $PROJECT_KEY..."

# Check if token is likely a token (starts with sqp_ or similar) or username/password combo
# For simplicity, we'll assume if only 2 args, it's a token. If 3, it's user/pass.
# But standard way is token.

ARGS="-Dsonar.projectKey=$PROJECT_KEY -Dsonar.sources=/usr/src/$PROJECT_PATH -Dsonar.host.url=http://sonarqube:9000"

if [ -n "$2" ]; then
    ARGS="$ARGS -Dsonar.login=$2"
else
    # Default fallback (might not work after first login)
    ARGS="$ARGS -Dsonar.login=admin -Dsonar.password=admin"
fi

docker compose run --rm sonar-scanner $ARGS
