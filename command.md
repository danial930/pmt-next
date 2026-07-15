# Development — creates tables + seeds in one command
npm run prisma:migrate:dev
npm run prisma:seed:dev

# Staging
npm run prisma:migrate:staging
npm run prisma:seed:staging

# Production
npm run prisma:migrate:prod
npm run prisma:seed:prod

# Reset dev DB completely (wipes all data, re-runs migrations + auto-seeds)
npx prisma migrate reset