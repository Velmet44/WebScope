# WebScope v1.0.3

**Visual web crawler. Discover, map, and inspect website structures.**

WebScope turns any website URL into an interactive, explorable map — with live progress, per-page inspection, notes, and full export/import.

## What's new in v1.0.3

- **Redesigned welcome page:** animated aurora + grid background, spacious professional layout, and an "Open Source · MIT" footer link to the GitHub repository
- **Configure page centering:** the setup form is now centered vertically and horizontally instead of hugging the top-left corner

## What's new in v1.0.2

- **Fixed blank website map on hosted deployments (Render, etc.):** crawl state is now replayed over WebSocket when a client connects or reconnects. Previously, pages discovered before the browser's socket subscribed (common on Render due to proxy/TLS latency) were permanently missed, leaving the map blank while logs and stats kept updating
- **Fixed Configure page numeric inputs:** fields no longer snap back to the minimum value when cleared. You can now delete the value fully and retype; values clamp to their allowed range on blur

## What's new in v1.0.1

- **Performance fix for link-heavy sites (e.g. Shopify stores):** crawl events are now batched (flushed every 120ms or 50 links) instead of one WebSocket event per link, so the map renders instantly even when a page contains ~500 links
- **Aggregated external-link logs:** external links on a page collapse into a single readable line (`www.instagram.com/..., (+15 more) (20 total)`) instead of hundreds of log rows
- **Copy Logs button:** one-click copy of the live log panel (with timestamps) to the clipboard
- **Log panel overflow protection:** the visible log list is capped with a "showing last N of M" notice
- **Cleaner stop behavior:** pages that finish after a stop are recorded without dumping link floods

## Features

### Crawl Engine
- Queue-based crawler with URL normalization (relative/absolute URLs, fragments, trailing slashes, query strings)
- Same-domain / same-origin restrictions, external links recorded without crawling
- Configurable limits: max pages, max depth, max duration, timeout, concurrency, request delay
- `robots.txt` fetching, parsing, and enforcement
- Redirect following with final-URL tracking
- Metadata mode (fast) and full-content mode

### Live Experience
- Real-time WebSocket streaming of crawl events (logs, pages, links, stats)
- Live log panel with severity filtering, auto-scroll, and one-click copy
- Live statistics: pages, links, external/broken links, errors, robots-blocked, elapsed time, response times
- Pause, resume, and stop controls

### Website Map
- Hierarchical tree of discovered pages with expand/collapse, zoom, fit-to-view
- Status indicators: crawled, active, queued, error, blocked, external

### Page Inspection
- Info / Content / Links / Notes tabs per page
- Content viewer: extracted text, raw HTML, sandboxed visual preview, metadata
- Incoming/outgoing links with one-click navigation
- Comments on any page

### Project Management
- Export to `.webscope` / `.json` with per-section options and size estimation
- Validated import with friendly errors

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Express, WebSocket (`ws`), cheerio. Single Node.js process in production — one port serves the UI, API, and live events.

## Quick Start

```bash
npm install
npm run dev:all   # development (Vite + backend)
npm run build && npm start   # production
```

## Links

- Repository: https://github.com/Velmet44/WebScope
- Readme: https://github.com/Velmet44/WebScope/blob/main/README.md