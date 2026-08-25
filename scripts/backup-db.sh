#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL precisa estar configurada no ambiente." >&2
  exit 1
fi

output_dir="${1:-backups}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output_file="${output_dir%/}/vg-marketing-${timestamp}.dump"

umask 077
mkdir -p "$output_dir"
pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="$output_file" \
  "$DATABASE_URL"

echo "Backup criado em: $output_file"