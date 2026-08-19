# WebScope v1.0.0

**Visual web crawler. Discover, map, and inspect website structures.**

WebScope turns any website URL into an interactive, explorable map — with live progress, per-page inspection, notes, and full export/import.

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
- Live log panel with severity filtering and auto-scroll
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