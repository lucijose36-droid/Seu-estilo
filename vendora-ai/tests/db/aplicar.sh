#!/usr/bin/env bash
# Recria o banco de teste do zero e aplica todas as migrations em ordem.
# "Do zero" e o ponto: uma migration que so funciona sobre um banco ja
# existente nao serve para provisionar um ambiente novo.
set -euo pipefail

BANCO="${1:-vendora_teste}"
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ="$(cd "$AQUI/../.." && pwd)"

psql -v ON_ERROR_STOP=1 -q -d postgres -c "drop database if exists $BANCO" >/dev/null
psql -v ON_ERROR_STOP=1 -q -d postgres -c "create database $BANCO" >/dev/null

echo "Banco $BANCO recriado."

psql -v ON_ERROR_STOP=1 -q -d "$BANCO" -f "$AQUI/00_shim_auth.sql"
echo "  shim de auth aplicado (apenas teste local)"

for arquivo in "$RAIZ"/supabase/migrations/*.sql; do
  psql -v ON_ERROR_STOP=1 -q -d "$BANCO" -f "$arquivo"
  echo "  $(basename "$arquivo")"
done

echo "Migrations aplicadas."
