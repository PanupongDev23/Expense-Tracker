# Expense Tracker

Spec-driven Expense Tracker MVP built with Next.js, Drizzle ORM, Auth.js Credentials, and Neon PostgreSQL.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`.
3. Create a Neon project and paste the pooled PostgreSQL connection string into `DATABASE_URL`.
4. Generate and apply migrations:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

If you do not have Neon yet, leave `DATABASE_URL` empty and run `npm run dev`. In local development, the login page will show a demo bypass button that uses in-memory data.

## Demo Flow

Register, add salary income, add food and transport expenses, inspect the dashboard, then set a monthly budget.
