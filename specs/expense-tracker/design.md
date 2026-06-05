# Design: Expense Tracker

## Architecture

```text
Browser
  -> Next.js App
  -> Server Actions / API Routes
  -> Neon PostgreSQL
```

The application uses a single Next.js project deployed on Vercel. Server-side code handles authentication, validation, database queries, and dashboard aggregation.

## Pages

| Route | Purpose |
| --- | --- |
| `/login` | Login form |
| `/register` | Register form |
| `/dashboard` | Monthly summary and charts |
| `/transactions` | Transaction list with filters |
| `/transactions/new` | Add transaction form |
| `/transactions/[id]/edit` | Edit transaction form |
| `/budget` | Monthly budget setup and status |
| `/settings` | Basic account and category settings |

## Data Model

### users

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| email | text | Unique |
| password_hash | text | Nullable if external auth is used |
| created_at | timestamp | Default now |

### categories

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | Nullable for default categories |
| name | text | Category name |
| type | text | `income` or `expense` |
| created_at | timestamp | Default now |

### transactions

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | Owner |
| category_id | uuid | Category reference |
| type | text | `income` or `expense` |
| amount | numeric | Must be greater than 0 |
| transaction_date | date | User-selected date |
| note | text | Optional |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### budgets

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | Owner |
| month | text | Format `YYYY-MM` |
| amount | numeric | Monthly budget |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

## Main Components

| Component | Purpose |
| --- | --- |
| `AppShell` | Shared layout and navigation |
| `DashboardSummary` | Income, expense, and balance cards |
| `ExpenseCategoryChart` | Pie or bar chart by expense category |
| `RecentTransactions` | Latest records |
| `TransactionForm` | Create and edit transaction |
| `TransactionTable` | List, filter, edit, delete |
| `BudgetStatus` | Budget usage and status |
| `CategorySelect` | Category dropdown filtered by type |

## API / Server Operations

| Operation | Input | Output |
| --- | --- | --- |
| `createTransaction` | type, amount, categoryId, date, note | Created transaction |
| `updateTransaction` | transaction id and fields | Updated transaction |
| `deleteTransaction` | transaction id | Success state |
| `listTransactions` | month, type, category | Transaction list |
| `getDashboardSummary` | month | Totals and chart data |
| `upsertBudget` | month, amount | Saved budget |
| `listCategories` | type | Category list |
| `createCategory` | name, type | Created category |

## Dashboard Calculation

```text
totalIncome = sum(transactions where type = income and month = selectedMonth)
totalExpense = sum(transactions where type = expense and month = selectedMonth)
balance = totalIncome - totalExpense
budgetUsage = totalExpense / monthlyBudget
```

Budget status:

| Condition | Status |
| --- | --- |
| No budget | `not_set` |
| Usage < 80 percent | `within_budget` |
| Usage >= 80 percent and <= 100 percent | `near_limit` |
| Usage > 100 percent | `over_budget` |

## Validation Rules

- Email must be valid.
- Amount must be greater than zero.
- Transaction type must be `income` or `expense`.
- Category must match transaction type.
- Date is required.
- Budget amount must be greater than zero.

## Demo Constraints

- Keep UI simple and responsive.
- Avoid optional features during MVP.
- Use seeded sample categories for clarity.
- Prioritize a complete end-to-end flow over feature breadth.

