# Requirements: Expense Tracker

## Purpose

This file converts the PRD into implementable requirements for spec-driven development.

## Requirement 1: Authentication

### User Story

As a user, I want to register and login so that my financial data is private.

### Acceptance Criteria

- Given a new visitor, when they register with valid credentials, then an account is created.
- Given a registered user, when they login with valid credentials, then they can access the dashboard.
- Given an unauthenticated visitor, when they open protected pages, then they are redirected to login.
- Given an authenticated user, when they request data, then only their own data is returned.

## Requirement 2: Transaction CRUD

### User Story

As a user, I want to manage income and expense records so that I can track my money.

### Acceptance Criteria

- Given a logged-in user, when they create a transaction with valid data, then it appears in the transaction list.
- Given a logged-in user, when they edit a transaction, then the updated values are saved.
- Given a logged-in user, when they delete a transaction, then it is removed from their list.
- Given a transaction amount less than or equal to zero, when the form is submitted, then validation blocks submission.

## Requirement 3: Categories

### User Story

As a user, I want categories so that I can group income and expenses.

### Acceptance Criteria

- Given a new user, when they open the app, then default categories are available.
- Given a logged-in user, when they create a custom category, then it can be selected in transaction forms.
- Given a category type, when the user creates a transaction, then only matching categories are shown.

## Requirement 4: Dashboard

### User Story

As a user, I want a dashboard so that I can understand my monthly financial status quickly.

### Acceptance Criteria

- Given monthly transactions, when the dashboard loads, then total income is shown.
- Given monthly transactions, when the dashboard loads, then total expense is shown.
- Given income and expense totals, when the dashboard loads, then remaining balance is shown.
- Given expense transactions, when the dashboard loads, then category breakdown is shown.
- Given recent transactions, when the dashboard loads, then the latest records are shown.

## Requirement 5: Monthly Budget

### User Story

As a user, I want to set a monthly budget so that I can monitor spending limits.

### Acceptance Criteria

- Given a logged-in user, when they set a monthly budget, then it is saved.
- Given monthly expenses below 80 percent of budget, then status is "within budget".
- Given monthly expenses from 80 percent up to 100 percent of budget, then status is "near limit".
- Given monthly expenses above budget, then status is "over budget".

## Requirement 6: Responsive UI

### User Story

As a user, I want to use the app on mobile and desktop so that I can track expenses anywhere.

### Acceptance Criteria

- Given a mobile viewport, when the app loads, then navigation and forms remain usable.
- Given a desktop viewport, when the app loads, then dashboard cards and charts use available space clearly.

