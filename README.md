# NevUp Behavioral Intelligence Platform

A high-performance API for analyzing trader behavioral pathologies, built for the NevUp Hackathon 2026.

## Features
- **Behavioral Metrics Engine**: Calculates Plan Adherence, Revenge Trading, Session Tilt, Emotional Win Rates, and Overtrading.
- **Tenancy Enforcement**: Uses JWT HS256 to ensure users can only access their own data.
- **Structured Logging**: JSON logging with `traceId` for full request traceability.
- **Zero-Config Database**: Uses SQLite for extreme portability and ease of testing.

## Prerequisites
- Node.js 20+

## Quick Start (Local Run)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Initialize and seed the database:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. The API will be available at `http://localhost:4010`.

## API Endpoints
- `GET /health`: Service health status.
- `GET /users/:userId/metrics`: Behavioral metrics for a specific user.
  - Requires `Authorization: Bearer <token>`
  - `userId` must match the `sub` claim in the JWT.

## Architectural Decisions
See [DECISIONS.md](./DECISIONS.md) for details on the tech stack and implementation logic.
