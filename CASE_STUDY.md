# Case Study: Dynamic Portfolio Dashboard with React.js, TypeScript, Tailwind & Node.js

## 1. Introduction

### Context
Modern investors need real-time insights into portfolio performance to make informed decisions. This application displays portfolio information and fetches live market data.

### Goal
Build a portfolio dashboard that retrieves stock data from:
- Yahoo Finance (Current Market Price - CMP)
- Google Finance (P/E Ratio and Latest Earnings)

The dashboard is interactive and visually appealing, implemented using Next.js (React), TypeScript, Tailwind CSS, and server-side routes (Node.js).

### Target Audience / Capability Assessment
- Full‑stack web development with React/Next.js + Node.js
- Consuming and processing external APIs
- Handling async operations and data transformations
- Designing a user‑friendly interface for financial data

## 2. Requirements

### Data Sources
- Yahoo Finance API (unofficial): Real-time CMP via `yahoo-finance2` on the server
- Google Finance (no official API): P/E Ratio and Latest Earnings via server-side HTML fetching and parsing (Axios + resilient regex)

Data format: Normalized JSON between server and client.

### Functionality
- Portfolio Table columns:
  - Particulars (Stock Name)
  - Purchase Price
  - Quantity (Qty)
  - Investment (Purchase Price × Qty)
  - Portfolio (%)
  - NSE/BSE
  - CMP (Yahoo Finance)
  - Present Value (CMP × Qty)
  - Gain/Loss (Present Value – Investment)
  - P/E Ratio (Google Finance)
  - Latest Earnings (Google Finance)
- Dynamic updates: CMP, Present Value, Gain/Loss auto-refresh every 15s (configurable) during market hours
- Visual indicators: Gain/Loss colored (green for gains, red for losses)
- Sector grouping:
  - Total Investment
  - Total Present Value
  - Gain/Loss

### Technology Stack
- Frontend: Next.js (React), TypeScript, Tailwind CSS
- Backend: Next.js server (Node.js) API route at `src/app/api/financial/route.ts`
- Data Fetching: `fetch`, `axios`, and `yahoo-finance2`
- Recommended libs used: `@tanstack/react-table`; `recharts` available for future charts

## 3. Technical Challenges and Considerations

### API Limitations
- Unofficial APIs / Scraping: Yahoo/Google require unofficial libs or scraping; we wrap parsing server-side to avoid CORS and to isolate breakage if markup changes.
- Rate Limiting: Batching, caching (30s TTL), and a rate-limited fetcher prevent overload.
- Data Accuracy: We surface timestamps and use sector defaults/mocks as graceful fallback.

### Asynchronous Operations
- Parallel fetching with `Promise.allSettled`; retries and backoff in the service layer.

### Data Transformation
- Server normalizes data to `{ cmp, peRatio, latestEarnings, lastUpdated }` per symbol.

### Performance Optimization
- In-memory cache, batched requests, memoized columns/cells, minimal rerenders.

### Error Handling
- Structured `ApiResponse` payloads with `success` and `error`; graceful degradation.

### Security
- No API keys exposed client-side; all network calls run server-side.

### Real-Time Updates
- `setInterval` refresh every `UPDATE_INTERVAL_MS` (default 15s) during market hours.
- Optional WebSockets can be added later.

### Responsiveness
- Tailwind responsive utilities; table supports horizontal scroll on small screens.

## 4. Implementation Steps (mapped to this repo)
1. Set up Next.js project (see `package.json` scripts)
2. Data model in `src/types/portfolio.ts`
3. API integration in `src/app/api/financial/route.ts` and `src/services/financialApi.ts`
4. Portfolio table in `src/components/PortfolioTable.tsx` (TanStack Table)
5. Dynamic updates via `PortfolioDashboard.tsx` auto-refresh effect and manual refresh
6. Sector grouping in `src/components/SectorSummary.tsx` and service aggregations
7. Visual indicators in table cells (green/red Gain/Loss)
8. Error handling with user-facing status and server structured responses
9. Performance: caching, batching, memoization; config in `src/config/env.ts`
10. Deploy: Ready for Vercel/Node hosting

## 5. Evaluation Criteria (how this solution addresses them)
- Functionality: Meets all table columns, live updates, sector summaries
- Code Quality: TypeScript, modular services, clear separation of concerns
- Performance: Caching, batching, memoization, minimal rerenders
- Error Handling: Structured errors, retries, graceful fallbacks
- API Strategy: Server-side Yahoo + Google scraping with isolation and caching
- UI: Responsive Tailwind UI, clear indicators, status messages

## 6. Deliverables
- Source code: This repository
- README: Setup and usage instructions (see `README.md`)
- Technical Document: Challenges and solutions (see `TECHNICAL_DOCUMENT.md`)

---

### Key Files
- `src/app/api/financial/route.ts` — Server-side route aggregating Yahoo (CMP) and Google (P/E, Earnings)
- `src/services/financialApi.ts` — Client-side service using the server route, with caching and retries
- `src/services/portfolioService.ts` — Business logic: batch fetching, PV and P/L calculations, sector summaries
- `src/components/PortfolioDashboard.tsx` — Orchestration, auto-refresh, status, and actions
- `src/components/PortfolioTable.tsx` — Tabular view (TanStack Table)
- `src/components/SectorSummary.tsx` — Sector-level summaries
- `src/config/env.ts` — Configurable environment values and defaults


