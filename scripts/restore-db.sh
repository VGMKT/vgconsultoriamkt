#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL precisa estar configurada no ambiente." >&2
  exit 1
fi

if [[ "${1:-}" != "--confirm" || -z "${2:-}" ]]; then
  echo "Uso: DATABASE_URL=... $0 --confirm caminho/backup.dump" >&2
  echo "A restauração substitui objetos existentes no banco informado." >&2
  exit 2
fi

backup_file="$2"
if [[ ! -f "$backup_file" ]]; then
  echo "Arquivo de backup não encontrado: $backup_file" >&2
  exit 1
fi

pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="$DATABASE_URL" \
  "$backup_file"

echo "Restauração concluída a partir de: $backup_file"