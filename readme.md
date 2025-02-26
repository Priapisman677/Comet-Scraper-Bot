

# Scraper Project

This repository contains a web scraper built with Playwright and a backend API. Below are the instructions for running tests and understanding the environment variable setup.

## Tech Stack
Backend: Node.js (TypeScript)
Web Scraping: Playwright
Database: PostgreSQL (via Prisma ORM)
Testing: Vitest + Playwright
Environment Management: dotenv-cli


## Run database migrations
npx prisma migrate dev

## Build:
npm run build

## Start the API
npm run dev:server



                ººººººº 🧪 Running Tests   ººººººº

### Run All API Route Tests
Basic tests for all routes are included. To run them, use:
npm run test


### Run Scraper-Specific Tests
Since website structures may change over time, please test the scraper separately:
npx playwright test



##  Environment Variables Setup (Vitest + PostgreSQL)

This project relies on **three** environment variable files. 

### 📌 **1. `.env` (Root Directory)**
- This file contains **two database URLs**:
  - One for the **test database**.
  - One for the **production database**.

#### ⚠️ Important:
- These URLs are **only used for migrations**.
- The project runs fine **even if they are commented out**.
- If you need to run migrations, **uncomment the relevant database URL, run the migration, then re-comment it.**

---

### 📌 **2. `config/` Folder (Contains Two `.env` Files)**
- These are the environment variables used **during runtime** (test or development).
- The active `.env` file depends on the script you use.

#### ✅ Running the Project with the Correct `.env`:
- **For Testing (Vitest + PostgreSQL):**
dotenv -e ./config/test.env -- vitest


- **For Development:**
dotenv -e ./config/dev.env -- npx nodemon --watch src --exec "npx tsx src/app-listens.ts"


Both environment files are loaded using the **`dotenv-cli`** package.

---

## ❓ Common Questions

### Q: Why are there two `.env` files in `config/`, but only one is used at a time?
A: The active `.env` file depends on the script you're running. **Only one environment file is loaded at a time.**






