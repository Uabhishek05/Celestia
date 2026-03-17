#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
MONGO_DATA_DIR="$ROOT_DIR/.data/db"
MONGO_LOG_DIR="$ROOT_DIR/.data/logs"
MONGO_LOG_FILE="$MONGO_LOG_DIR/mongod.log"

mkdir -p "$MONGO_DATA_DIR" "$MONGO_LOG_DIR"

if command -v mongod >/dev/null 2>&1; then
  if ! pgrep -f "mongod.*--port 27017" >/dev/null 2>&1; then
    echo "Starting local MongoDB..."
    if ! mongod \
      --dbpath "$MONGO_DATA_DIR" \
      --port 27017 \
      --bind_ip 127.0.0.1 \
      --nounixsocket \
      --logpath "$MONGO_LOG_FILE" \
      --fork; then
      echo "MongoDB did not start. Check $MONGO_LOG_FILE for details."
    fi
  fi
else
  echo "mongod is not installed. Set backend MONGODB_URI to Atlas or install MongoDB locally."
fi

pushd "$ROOT_DIR/backend" >/dev/null
if [ ! -d node_modules ]; then
  npm install
fi
PORT=${PORT:-5000}
npm run dev &
BACKEND_PID=$!
popd >/dev/null

pushd "$ROOT_DIR/frontend" >/dev/null
if [ ! -d node_modules ]; then
  npm install
fi
npm run dev
popd >/dev/null

kill "$BACKEND_PID" >/dev/null 2>&1 || true
