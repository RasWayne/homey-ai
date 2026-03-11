# Prisma Migration Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Create/apply local migration:

```bash
npm run prisma:migrate:dev -- --name init
```

4. Deploy migrations in non-local environments:

```bash
npm run prisma:migrate:deploy
```
