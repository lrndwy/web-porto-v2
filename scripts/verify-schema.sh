#!/usr/bin/env bash
# Applies the migrations and seed to a throwaway local Postgres (the same
# Postgres 18 the developer already has) and runs the schema assertions.
#
# This is the plan's "apply all seven migrations to a fresh project" check,
# without needing Docker or a hosted Supabase project. Supabase-specific
# surfaces the shim cannot model (Storage, PostgREST, GoTrue) are not covered.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${WP_PG_PORT:-55432}"
WORKDIR="${TMPDIR:-/tmp}/wp-schema-verify"
PGDATA="$WORKDIR/data"
SOCKET="$WORKDIR/sock"

cleanup() {
  if [ -d "$PGDATA" ]; then
    pg_ctl -D "$PGDATA" -m immediate stop >/dev/null 2>&1 || true
  fi
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

rm -rf "$WORKDIR"
mkdir -p "$SOCKET"

initdb -D "$PGDATA" -U postgres --auth=trust >/dev/null
pg_ctl -D "$PGDATA" -o "-p $PORT -k $SOCKET -c listen_addresses=''" -w start >/dev/null

psql() { command psql -h "$SOCKET" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 "$@"; }

psql -d postgres -q -f "$ROOT/supabase/tests/shim.sql"

for migration in "$ROOT"/supabase/migrations/*.sql; do
  echo "applying $(basename "$migration")"
  psql -d postgres -q -f "$migration"
done

echo "applying seed.sql"
psql -d postgres -q -f "$ROOT/supabase/seed.sql"
echo "re-applying seed.sql (idempotency)"
psql -d postgres -q -f "$ROOT/supabase/seed.sql"

psql -d postgres -f "$ROOT/supabase/tests/assertions.sql"
