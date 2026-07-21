#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if [ "${NODE_ENV:-development}" = test ] && [ -n "${RUNTIME_PROJECT_SOURCE:-}" ] && [ -d "$RUNTIME_PROJECT_SOURCE" ]; then
  project_dir=$RUNTIME_PROJECT_SOURCE
fi
command_name=${1:-check}

fail() {
  echo "error: $1" >&2
  exit 1
}

check_config() {
  if [ "${NODE_ENV:-development}" = test ]; then
    DEFAULT_TENANT_ID=${TENANT_ID:-}
    CORS_ORIGIN="http://127.0.0.1:${FRONTEND_PORT:-}"
    CLIENT_URL=$CORS_ORIGIN
    export DEFAULT_TENANT_ID CORS_ORIGIN CLIENT_URL
  fi
  jwt_secret=${JWT_SECRET:-}
  refresh_secret=${JWT_REFRESH_SECRET:-}
  command -v node >/dev/null 2>&1 || fail "node is required"
  command -v npm >/dev/null 2>&1 || fail "npm is required"
  [ -n "${DATABASE_URL:-}" ] || fail "DATABASE_URL is required"
  [ -n "${DEFAULT_TENANT_ID:-}" ] || fail "DEFAULT_TENANT_ID is required"
  case "${BACKEND_PORT:-}" in ''|*[!0-9]*) fail "BACKEND_PORT must be an explicit integer" ;; esac
  [ "$BACKEND_PORT" -ge 1024 ] && [ "$BACKEND_PORT" -le 65535 ] || fail "BACKEND_PORT must be between 1024 and 65535"
  [ "${#jwt_secret}" -ge 32 ] || fail "JWT_SECRET must contain at least 32 characters"
  [ "${#refresh_secret}" -ge 32 ] || fail "JWT_REFRESH_SECRET must contain at least 32 characters"
  case "$DATABASE_URL" in
    *example*|*changeme*|*password@*) fail "DATABASE_URL contains a placeholder" ;;
  esac
  if [ "${NODE_ENV:-development}" = "production" ]; then
    [ -n "${CORS_ORIGIN:-}" ] || fail "CORS_ORIGIN is required in production"
    [ "${ENABLE_GENERATED_FEATURES:-false}" != "true" ] || fail "generated features are forbidden in production"
  fi
  echo "configuration valid"
}

case "$command_name" in
  check)
    check_config
    (cd "$project_dir/server" && npm run build && npm test)
    ;;
  migrate)
    check_config
    (cd "$project_dir/server" && npm run migrate)
    ;;
  start)
    check_config
    if lsof -nP -iTCP:"$BACKEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then fail "assigned port $BACKEND_PORT is occupied"; fi
    PORT=$BACKEND_PORT
    BACKEND_HOST=127.0.0.1
    RUNTIME_LAUNCH_SERVER=true
    export PORT BACKEND_HOST RUNTIME_LAUNCH_SERVER
    (cd "$project_dir/server" && exec npm start)
    ;;
  *)
    fail "usage: ./start.sh [check|migrate|start]"
    ;;
esac
