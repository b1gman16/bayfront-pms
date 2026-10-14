# Bayfront Resort PMS: Windows setup

## One-time installs
1. Docker Desktop (enable WSL2 when asked, restart if prompted): https://www.docker.com/products/docker-desktop
2. Node.js 20 LTS: https://nodejs.org

## Run (PowerShell, in the project folder)
copy .env.example .env          # then open .env in Notepad and set DB_PASSWORD, NEXTAUTH_SECRET, ID_ENCRYPTION_KEY
                                # (DB_PASSWORD must match the password inside DATABASE_URL)
docker compose up -d
npm install
npx prisma migrate dev --name init
npm run db:constraints
npm run seed                    # prints the admin password: save it
npm run build
npm start                       # open http://localhost:3000

## Other computers on the resort network
Find the server PC's address with `ipconfig` (IPv4), then open http://THAT-ADDRESS:3000 on the other PCs.
Allow port 3000 in Windows Firewall (private network only). Give the server PC a fixed IP in the router.
Set NEXTAUTH_URL in .env to that address.

## Keep it running
- Docker Desktop: Settings > General > "Start Docker Desktop when you sign in".
- Windows: set the PC to never sleep, and use a UPS.
- Auto-start the app after reboot: Task Scheduler > "At startup" > run `npm start` in the project folder.

## Backups
Task Scheduler > daily 2:00 AM > powershell -ExecutionPolicy Bypass -File "C:\bayfront-pms\scripts\backup.ps1"
Restore test: docker compose exec -T db sh -c "gunzip -c /tmp/backup.sql.gz | psql -U bayfront bayfront"

Tests: npm test

## If you already ran an older version
Delete the `node_modules` folder and `package-lock.json`, then run `npm install` again (versions are now pinned to Next.js 14).
Then continue from `npx prisma migrate dev --name init`. Run commands ONE AT A TIME and stop at the first error.
