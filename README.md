# WebScope

**Visual web crawler. Discover, map, and inspect website structures.**

WebScope is a local-first visual web crawler that turns any website URL into an interactive, explorable map. Configure crawl limits, watch live progress, inspect individual pages, annotate your findings, and export everything for later.

```
             Example
            /   |    \
        About Products Blog
              /    \
          Phone    Laptop
```

---

## Features

### Crawl Engine
- Queue-based crawler with URL normalization (relative/absolute URLs, fragments, trailing slashes, query strings)
- Same-domain and same-origin restrictions with external link recording
- Configurable limits: max pages, max depth, max duration, request timeout, concurrency, request delay
- `robots.txt` fetching, parsing, and enforcement — displayed clearly in the UI
- Redirect following with final-URL tracking
- Metadata mode (titles, descriptions, status codes, response times) and full-content mode
- Per-page content fetching on demand after the crawl

### Live Experience
- Real-time WebSocket streaming of crawl events (logs, pages, links, statistics)
- Live log panel with severity filtering (info / warning / error / success) and auto-scroll
- Live statistics: pages crawled, discovered, links, external links, broken links, errors, robots-blocked, elapsed time, average response time, data size
- Pause, resume, and stop controls

### Website Map
- Hierarchical tree of discovered pages (first-discovery path)
- Expand / collapse per node, expand all, collapse all
- Zoom (buttons + Ctrl+scroll), fit to view
- Status indicators: crawled, active, queued, error, blocked, external
- Cross-link indicators on nodes with outgoing links

### Page Inspection
- Tabbed detail panel: Info / Content / Links / Notes
- URL copy and open-in-browser
- Full metadata: status code, depth, content type, response time, discovered/crawled timestamps, robots status
- Content viewer with text, HTML source, and metadata views
- Incoming / outgoing links with one-click navigation
- Attach comments/notes to any page

### Project Management
- Export to `.webscope` (versioned JSON) or plain `.json`
- Export options: metadata, relationships, comments, settings, logs, content, raw HTML
- File size estimation before export
- Import with validation and friendly error messages for invalid/corrupt files
- All data stays local — no cloud servers involved

---

## Architecture

```
WebScope Desktop App
        |
        +-- React Frontend (TypeScript, Vite, Tailwind)
        |
        +-- Express API + WebSocket server (Node.js)
        |       |
        |       +-- Crawler engine (queue, fetch, parse)
        |       +-- robots.txt parser
        |       +-- HTML parser (cheerio)
        |
        +-- Internet
              |
              +-- Website A
              +-- Website B
```

### Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router, Lucide icons
- **Backend:** Node.js, Express, WebSocket (ws), cheerio
- **Communication:** REST API for crawl control, WebSocket for live event streaming

### Project Structure

```
├── src/                    # Frontend
│   ├── components/         # UI components (TopBar, MapPanel, LogPanel, ...)
│   ├── hooks/              # WebSocket hook + API client
│   ├── lib/                # Export/import utilities
│   ├── pages/              # Welcome, Configure, Workspace
│   ├── stores/             # Zustand state management
│   └── types/              # Shared TypeScript types
├── server/                 # Backend
│   ├── crawler.ts          # Crawl engine (queue, limits, fetch, state)
│   ├── parser.ts           # HTML parsing / link extraction
│   ├── robots.ts           # robots.txt retrieval + parsing
│   ├── routes.ts           # REST API
│   └── websocket.ts        # WebSocket event broadcasting
└── public/                 # Static assets
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on 24.x)
- npm

### Install

```bash
npm install
```

### Development

Run both the frontend and backend together:

```bash
npm run dev:all
```

Or separately:

```bash
npm run dev           # Vite frontend on :5173
npm run dev:server    # Express backend on :3001
```

The frontend proxies `/api` and `/ws` requests to the backend, so no CORS issues in development.

### Production Build

```bash
npm run build
npm run preview
```

### Push to GitHub

Double-click `push-to-github.bat` (or run it from the terminal):

```bat
push-to-github.bat "your commit message"
```

This stages all files, commits with your message, and pushes to `origin main`.

---

## Usage Flow

1. **Welcome** — Start a new crawl or import an existing `.webscope`/`.json` project.
2. **Configure** — Enter the starting URL, set crawl scope, limits, network behavior, and content mode.
3. **Confirm** — Acknowledge the responsible-use notice (required before crawling).
4. **Workspace** — Watch pages appear in the map in real time as the crawler works:
   - **Left panel:** live statistics and robots.txt status
   - **Center:** interactive website map (expand, collapse, zoom, pan)
   - **Right panel:** live logs, or page details when a node is selected
5. **Inspect** — Select any page to view metadata, content, links, and add notes.
6. **Export** — Save the project as `.webscope` or `.json` with your preferred data included.
7. **Import** — Reopen any previous export; invalid files produce a clear error instead of crashing.

---

## Data Format

The `.webscope` format is versioned JSON:

```json
{
  "format": "webscope",
  "version": 1,
  "project": {
    "name": "Example Crawl",
    "startUrl": "https://example.com"
  },
  "settings": {},
  "pages": [],
  "links": [],
  "comments": [],
  "logs": [],
  "metadata": {}
}
```

Future versions can migrate older projects. Plain `.json` exports use the same schema for interoperability with external tools.

---

## Safety & Responsible Use

WebScope is a local-first tool designed with safety in mind:

- **Respects `robots.txt`** — instructions are retrieved, parsed, and enforced before crawling
- **Conservative by default** — same-domain only, external links recorded but not crawled
- **Hard limits** — max pages, max depth, max duration, request timeouts, bounded concurrency
- **No rendering of remote HTML** — content is shown as extracted text/source, never executed
- **Validated imports** — corrupt or invalid files are rejected with friendly errors
- **No telemetry** — crawl data never leaves your machine

A missing `robots.txt` simply means no crawler instructions were provided — it is not treated as permission to crawl anything. WebScope does not determine whether scraping a website is legally permissible; that depends on context and jurisdiction. Users confirm they have the right and permission to crawl their targets and will use the tool responsibly.

---

## Roadmap

- [x] Stage 1: UI shell, design system, pages
- [x] Stage 2: Crawl engine backend
- [x] Stage 3: Live crawl experience
- [x] Stage 4: Website map visualization
- [x] Stage 5: Page inspection & content viewer
- [x] Stage 6: Export/import, README, polish

Future ideas: sitemap.xml support, broken-link reports, search across crawled pages, filtering by status/depth, response-time graphs, dark/light themes, keyboard shortcuts, re-crawl selected pages, crawl comparison.

---

## License

MIT