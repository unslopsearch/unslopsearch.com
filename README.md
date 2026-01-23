# Unslop Search

A privacy-focused search engine aggregator that lets you search Google, DuckDuckGo, Brave, Startpage, Qwant, Mojeek, and Presearch — all with AI features disabled.

**Live site: [unslopsearch.com](https://unslopsearch.com)**

## Why?

Google's AI Overview and similar AI features are increasingly forced on users. They're slow, often inaccurate, and many people just want the classic "10 blue links" search results.

Unslop Search solves this by:
- Adding `udm=14` to Google searches (forces the "Web" tab, no AI)
- Applying AI-disabling parameters to DuckDuckGo, Brave, and others
- Letting you switch between search engines easily
- Storing preferences locally (no accounts, no tracking)

## Features

- **Multiple search engines** - Google, DuckDuckGo, Brave, Startpage, Qwant, Mojeek, Presearch
- **AI disabled by default** - Each engine configured to skip AI summaries
- **OpenSearch support** - Add as your browser's default search engine
- **PWA support** - Install on mobile as an app
- **Privacy-first** - No tracking, no accounts, preferences stored in localStorage
- **Fast** - Static site deployed on Cloudflare Pages

## Guides

The site includes SEO-optimized guides:
- [Disable AI Overview on Google](https://unslopsearch.com/guides/disable-ai-overview-google)
- [Best Private Search Engines](https://unslopsearch.com/guides/best-private-search-engines)
- [Set Default Search Engine](https://unslopsearch.com/guides/set-default-search-engine)
- [DuckDuckGo vs Google](https://unslopsearch.com/guides/duckduckgo-vs-google)
- [What is udm=14?](https://unslopsearch.com/guides/what-is-udm14)

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repo
git clone https://github.com/unslopsearch/unslopsearch.com.git
cd unslopsearch.com

# Install dependencies
npm install

# Start dev server
npm run dev
```

The site will be available at `http://localhost:4321`

### Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build and deploy to Cloudflare Pages |

### Project Structure

```
/
├── public/
│   ├── opensearch.xml    # OpenSearch descriptor
│   ├── manifest.json     # PWA manifest
│   └── ...               # Icons and static assets
├── src/
│   └── pages/
│       ├── index.astro   # Homepage with search
│       ├── search.astro  # Search redirect handler
│       └── guides/       # SEO guide pages
├── extension/            # Browser extension (WIP)
└── package.json
```

## How It Works

### Google (udm=14)

The `udm=14` parameter forces Google's "Web" tab, which shows classic search results without:
- AI Overview summaries
- Featured snippets
- Knowledge panels
- Video carousels

### DuckDuckGo

Use `noai.duckduckgo.com` - DuckDuckGo's official AI-free subdomain. This disables:
- Duck.ai (AI chat)
- Search Assist (AI answers)
- AI-generated images

Alternative: Parameters `kbg=-1`, `kbe=-1`, and `kbd=-1` disable AI features on the main domain.

### Brave Search

Parameter `summary=0` disables the "Summarize with AI" feature.

### Other Engines

Startpage, Qwant, Mojeek, and Presearch don't have forced AI features, so they work as-is.

## Contributing

Contributions are welcome! Some ideas:

- Add more search engines
- Improve the guides content
- Add translations
- Fix bugs or improve UX

Please open an issue first to discuss significant changes.

## Tech Stack

- [Astro](https://astro.build) - Static site framework
- [Cloudflare Pages](https://pages.cloudflare.com) - Hosting
- No JavaScript frameworks - vanilla JS for interactivity

## License

MIT License - see [LICENSE](LICENSE) for details.

## Related

- [udm14.com](https://udm14.com) - Similar concept, Google-only
- [tenbluelinks.org](https://tenbluelinks.org) - AI-free search advocacy
