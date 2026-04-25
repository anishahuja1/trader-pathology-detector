# Architectural Decisions - NevUp Behavioral Intelligence Platform

## 1. Technical Stack
- **Language**: TypeScript. Essential for maintaining a robust codebase in a behavioral analysis engine where data structures (Trades, Sessions) are complex.
- **Framework**: Express.js. Chosen for its minimal overhead and high performance, ensuring we meet the sub-200ms p95 latency requirement.
- **Database**: SQLite. Chosen for its zero-configuration requirement and extreme portability. This ensures the project runs immediately on any reviewer's machine without requiring a running PostgreSQL instance or Docker.
- **ORM**: Prisma. Provides type-safe queries and easy schema migrations.
- **Logging**: Winston. Structured JSON logging with `traceId` propagation for observability.
- **Authentication**: JWT HS256. Custom middleware implemented to enforce row-level tenancy as per the requirements.

## 2. Behavioral Logic Implementation
- **Plan Adherence**: Implemented as a rolling window average (size 10). This provides a smoothed view of trader discipline rather than a volatile per-trade metric.
- **Revenge Trading**: Detected using a time-window of 90 seconds post-loss combined with emotional state analysis.
- **Overtrading**: Uses a 30-minute sliding window to count trade density.

## 3. Performance & Scalability
- **Indexing**: Database indexes are applied to `userId`, `sessionId`, and `entryAt` to ensure O(log n) lookup times for metrics calculation.
- **Caching**: While not implemented in the MVP, the service is designed to easily integrate Redis for caching calculated metrics if load increases.
- **Containerization**: Multi-stage Docker builds used to minimize image size and ensure a consistent runtime environment.

## 4. Error Handling
- **Tenancy Enforcement**: Strict 403 Forbidden returns for cross-tenant access to prevent data leakage.
- **Traceability**: Every request is assigned a `traceId` which is included in all logs and error responses.
