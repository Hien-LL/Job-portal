#!/bin/bash
set -e

# Defaults (override via env)
MYSQL_HOST=${MYSQL_HOST:-mysql}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-}
MYSQL_USER=${MYSQL_USER:-jobportal}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-}
MYSQL_DATABASE=${MYSQL_DATABASE:-}
REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}

wait_for_mysql() {
  host="$1"
  port="$2"
  echo "Waiting for MySQL at $host:$port..."

  # If mysqladmin is available, use an authenticated ping (preferred)
  if command -v mysqladmin >/dev/null 2>&1; then
    until mysqladmin ping -h "$host" -P "$port" -u root -p"$MYSQL_ROOT_PASSWORD" >/dev/null 2>&1; do
      echo "  mysql not ready (mysqladmin ping failed) - sleeping 1s"
      sleep 1
    done
    echo "MySQL is responsive (mysqladmin)"
    return 0
  fi

  # If mysqladmin succeeded above, still ensure the application user and DB are accessible
  if command -v mysql >/dev/null 2>&1; then
    echo "Verifying database access using app credentials..."
    until mysql -h "$host" -P "$port" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1" "$MYSQL_DATABASE" >/dev/null 2>&1; do
      echo "  app user cannot query database yet - sleeping 1s"
      sleep 1
    done
    echo "App user can access database"
    return 0
  fi

  # Fallback: check TCP port
  until bash -c "</dev/tcp/$host/$port" >/dev/null 2>&1; do
    echo "  $host:$port not reachable yet - sleeping 1s"
    sleep 1
  done
  echo "MySQL port is open"
}

wait_for_tcp() {
  host="$1"
  port="$2"
  echo "Waiting for $host:$port..."
  until bash -c "</dev/tcp/$host/$port" >/dev/null 2>&1; do
    echo "  $host:$port not reachable yet - sleeping 1s"
    sleep 1
  done
  echo "$host:$port is reachable"
}

# Wait for MySQL (important for Spring Boot datasource)
wait_for_mysql "$MYSQL_HOST" "$MYSQL_PORT"

# Wait for Redis (optional, if used)
wait_for_tcp "$REDIS_HOST" "$REDIS_PORT"

# Run the application
exec java -jar /app/app.jar
