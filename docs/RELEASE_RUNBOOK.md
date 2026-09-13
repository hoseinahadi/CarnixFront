# Carnix release runbook

## Quality gate

Run the same checks used in CI before a release:

```powershell
cd ui
npm ci
npx tsc --noEmit
npm run lint -- --quiet
npm run build

cd ..\Admin
npm ci
npm run lint
npm run build

cd ..\Carnix
dotnet restore Carnix/Carnix/Carnix.csproj
dotnet build Carnix/Carnix/Carnix.csproj --configuration Release --no-restore
```

## Configuration

Secrets belong in the deployment environment, never in tracked JSON or `.env` files. Set the SMS key through the `SmsSettings__ApiKey` environment variable. Set the production database through `ConnectionStrings__DefaultConnection` and configure `DatabaseInitialization__ApplyMigrationsOnStartup` deliberately for the release process.

## Health verification

- `/health/live` confirms the process is serving HTTP.
- `/health/ready` confirms the API can connect to its database and returns `503` while the dependency is unavailable.
- The frontend deployment checks `http://localhost:3000/` after PM2 starts the new build.

## Rollback

Keep the previous standalone frontend artifact until the new health check passes. If it fails, stop the new PM2 process, restore the previous artifact, run `pm2 startOrRestart ecosystem.config.js --env production --update-env`, then verify `/` and `pm2 status` before closing the incident.
