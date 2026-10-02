#!/bin/sh
# Nightly backup. Cron: 0 2 * * * /path/to/scripts/backup.sh
set -e
DIR="${BACKUP_DIR:-/var/backups/bayfront}"; mkdir -p "$DIR"
F="$DIR/bayfront-$(date +%Y%m%d-%H%M).sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$F"
find "$DIR" -name 'bayfront-*.sql.gz' -mtime +30 -delete   # keep 30 days
echo "Backup written: $F  (copy off-site; test restore: gunzip -c FILE | psql NEWDB)"
