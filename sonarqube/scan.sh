#!/bin/bash

# Usage: ./scan.sh <path_to_project> <sonar_token>
# Example: ./scan.sh ../src/versions/v.6/inventory-system sqp_...

if [ -z "$1" ]; then
  echo "Usage: ./scan.sh <path_to_project> [sonar_token]"
  exit 1
fi

# Resolve absolute paths to handle relative paths like ../ correctly
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$(dirname "$SCRIPT_DIR")"

TARGET_DIR="$1"
if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Directory $TARGET_DIR does not exist."
    exit 1
fi

ABS_TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

# Check if target is inside workspace
if [[ "$ABS_TARGET_DIR" != "$WORKSPACE_ROOT"* ]]; then
    echo "Error: Target directory must be inside the workspace: $WORKSPACE_ROOT"
    exit 1
fi

# Get relative path from workspace root (e.g., src/versions/v.6/inventory-system)
RELATIVE_PATH="${ABS_TARGET_DIR#$WORKSPACE_ROOT/}"

PROJECT_NAME=$(basename "$RELATIVE_PATH")
PROJECT_KEY="project_${PROJECT_NAME}"

echo "Scanning $RELATIVE_PATH with key $PROJECT_KEY..."

# Base arguments
ARGS="-Dsonar.projectKey=$PROJECT_KEY -Dsonar.sources=/usr/src/$RELATIVE_PATH -Dsonar.host.url=http://sonarqube:9000"

# Auth handling
if [ -n "$2" ]; then
    # Assuming $2 is a token
    ARGS="$ARGS -Dsonar.token=$2"
else
    # Default fallback to admin/admin
    ARGS="$ARGS -Dsonar.login=admin -Dsonar.password=admin"
fi

docker compose run --rm sonar-scanner $ARGS
