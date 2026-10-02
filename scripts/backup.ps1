# Windows nightly backup. Run from the project folder (needs Docker running).
# Schedule: Task Scheduler -> daily 2:00 AM -> powershell -ExecutionPolicy Bypass -File "C:\bayfront-pms\scripts\backup.ps1"
$ErrorActionPreference = "Stop"
$dir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { "C:\BayfrontBackups" }
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$file = Join-Path $dir ("bayfront-" + (Get-Date -Format "yyyyMMdd-HHmm") + ".sql.gz")
docker compose exec -T db sh -c "pg_dump -U bayfront bayfront | gzip > /tmp/backup.sql.gz"
docker compose cp db:/tmp/backup.sql.gz $file
Get-ChildItem $dir -Filter "bayfront-*.sql.gz" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item
Write-Host "Backup written: $file  (copy it off-site, e.g. to an external drive or cloud folder)"
