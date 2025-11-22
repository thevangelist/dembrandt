# Dembrandt

A CLI tool for extracting design tokens and brand assets from any website. Powered by Playwright with advanced bot detection avoidance.

## Quick Start

```bash
npx dembrandt stripe.com
```

No installation required! Extract design tokens from any website in seconds.

## What It Does

Dembrandt analyzes live websites and extracts their complete design system:

- **Colors** — Brand colors, semantic roles, CSS variables with confidence scoring
- **Typography** — Font families, sizes, weights, line heights from all heading levels
- **Spacing** — Margin and padding scales with grid detection (4px/8px systems)
- **Shadows** — Box shadow values for elevation systems
- **Border Radius** — Corner radius patterns used across components
- **Buttons** — Component styles, variants, and interaction states
- **Inputs** — Form field styles and focus states
- **Breakpoints** — Responsive design breakpoints
- **Icons** — Detected icon libraries (Font Awesome, Material Icons, etc.)
- **Frameworks** — Identified CSS frameworks and libraries

Perfect for competitive analysis, brand audits, or rebuilding a brand when you don't have design guidelines.

## Installation

No installation needed! Just use `npx`:

```bash
npx dembrandt stripe.com
```

The first run will automatically install Chromium.

### Prerequisites
- Node.js 18 or higher

### From Source (for development)

```bash
git clone https://github.com/thevangelist/dembrandt.git
cd dembrandt
npm install
npm link
```

## Usage

### Basic Usage

```bash
npx dembrandt <url>

# Examples
npx dembrandt stripe.com
npx dembrandt https://github.com
npx dembrandt tailwindcss.com
```

### Options

**`--json-only`** - Output raw JSON to stdout instead of formatted terminal display
```bash
npx dembrandt stripe.com --json-only > tokens.json
```
Note: JSON is automatically saved to `output/domain.com/` regardless of this flag.

**`-d, --debug`** - Run with visible browser and detailed logs
```bash
npx dembrandt stripe.com --debug
```

Useful for troubleshooting bot detection, timeouts, or extraction issues.

## Features

### Advanced Bot Detection Avoidance
- Stealth mode with anti-detection scripts
- Automatic fallback to visible browser on detection
- Human-like interaction simulation (mouse movement, scrolling)
- Custom user agent and browser fingerprinting

### Smart Retry Logic
- Automatic retry on navigation failures (up to 2 attempts)
- SPA hydration detection and waiting
- Content validation to ensure page is fully loaded
- Detailed progress logging at each step

### Comprehensive Logging
- Real-time spinner with step-by-step progress
- Detailed extraction metrics (colors found, styles detected, etc.)
- Error context with URL, stage, and attempt information
- Debug mode with full stack traces

## What You Get

### Automatic JSON Saves

Every extraction is automatically saved to `output/domain.com/YYYY-MM-DDTHH-MM-SS.json` with:
- Complete design token data
- Timestamped for version tracking
- Organized by domain

Example: `output/stripe.com/2025-11-22T14-30-45.json`

### Terminal Output

Clean tables showing:
- Color palette with confidence ratings (with visual swatches)
- CSS variables with color previews
- Typography hierarchy
- Spacing scale (4px/8px grid detection)
- Shadow system
- Button variants
- Framework detection

### JSON Output Format

Full extraction data for programmatic use:

```json
{
  "colors": {
    "semantic": {
      "primary": "#3b82f6",
      "success": "#10b981"
    },
    "palette": [
      {
        "color": "#3b82f6",
        "confidence": "high",
        "sources": ["branding", "interactive"],
        "count": 45
      }
    ]
  },
  "typography": {
    "styles": [
      {
        "fontFamily": "Inter, sans-serif",
        "fontSize": "16px",
        "fontWeight": "400"
      }
    ]
  }
}
```

## How It Works

Uses Playwright to render the page. Extracts computed styles from the DOM. Analyzes color usage and confidence. Groups similar typography. Detects spacing patterns. Returns actionable design tokens.

### Color Confidence

- **High** — Logo, brand elements, primary buttons
- **Medium** — Interactive elements, icons, navigation
- **Low** — Generic UI components (filtered from display)

Only shows high and medium confidence colors in terminal. Full palette in JSON.

### Typography Detection

Samples all heading levels (h1-h6), body text, buttons, links. Groups by font family, size, and weight. Detects Google Fonts, Adobe Fonts, custom @font-face.

### Framework Detection

Recognizes Tailwind CSS, Bootstrap, Material-UI, and others by class patterns and CDN links.

## Examples

### Extract Design Tokens

```bash
# Analyze a single site (auto-saves JSON to output/stripe.com/)
npx dembrandt stripe.com

# View saved JSON files
ls output/stripe.com/

# Output to stdout for piping
npx dembrandt stripe.com --json-only | jq '.colors.semantic'

# Debug mode for difficult sites
npx dembrandt example.com --debug
```

### Compare Competitors

```bash
# Extract tokens from multiple competitors (auto-saved to output/)
for site in stripe.com square.com paypal.com; do
  npx dembrandt $site
done

# Compare color palettes from most recent extractions
jq '.colors.palette[] | select(.confidence=="high")' output/stripe.com/2025-11-22T*.json output/square.com/2025-11-22T*.json

# Compare semantic colors across competitors
jq '.colors.semantic' output/*/2025-11-22T*.json
```

### Integration with Design Tools

```bash
# Extract and convert to custom config format
npx dembrandt mysite.com --json-only | jq '{
  colors: .colors.semantic,
  fontFamily: .typography.sources,
  spacing: .spacing.commonValues
}' > design-tokens.json
```

## Use Cases

### Brand Audits
Extract and document your company's current design system from production websites.

### Competitive Analysis
Compare design systems across competitors to identify trends and opportunities.

### Design System Migration
Document legacy design tokens before migrating to a new system.

### Reverse Engineering
Rebuild a brand when original design guidelines are unavailable.

### Quality Assurance
Verify design consistency across different pages and environments.

## Output Format

### Terminal Output
Clean, formatted tables with:
- Color swatches with confidence indicators
- Typography hierarchy with context
- Component style breakdowns
- Framework and icon system detection

### JSON Output
Complete extraction data including:
```json
{
  "url": "https://example.com",
  "extractedAt": "2025-11-22T...",
  "colors": {
    "semantic": { "primary": "#3b82f6", ... },
    "palette": [{ "color": "#3b82f6", "confidence": "high", ... }],
    "cssVariables": { "--color-primary": "#3b82f6", ... }
  },
  "typography": {
    "styles": [...],
    "sources": { "googleFonts": [...], ... }
  },
  "spacing": { "scaleType": "8px", "commonValues": [...] },
  "components": { "buttons": [...], "inputs": [...] },
  "breakpoints": [...],
  "iconSystem": [...],
  "frameworks": [...]
}
```

## How It Works

1. **Browser Launch** - Launches Chromium with stealth configuration
2. **Anti-Detection** - Injects scripts to bypass bot detection
3. **Navigation** - Navigates to target URL with retry logic
4. **Hydration** - Waits for SPAs to fully load (8s initial + 4s stabilization)
5. **Content Validation** - Verifies page content is substantial (>500 chars)
6. **Parallel Extraction** - Runs all extractors concurrently for speed
7. **Analysis** - Analyzes computed styles, DOM structure, and CSS variables
8. **Scoring** - Assigns confidence scores based on context and usage

## Troubleshooting

### Bot Detection Issues
If you encounter timeouts or network errors:
```bash
npx dembrandt example.com --debug
```
This will automatically retry with a visible browser.

### Page Not Loading
Some sites require longer load times. The tool waits 8 seconds for SPA hydration, but you can modify this in the source.

### Empty Content
If content length is < 500 chars, the tool will automatically retry (up to 2 attempts).

### Debug Mode
Use `--debug` to see:
- Browser launch confirmation
- Step-by-step progress logs
- Full error stack traces
- Extraction metrics

## Limitations

- Captures default/light theme only (dark mode not detected)
- Hover/focus states extracted from CSS (not fully interactive)
- JavaScript-heavy sites require hydration time
- Some dynamically-loaded content may be missed
- Requires viewport simulation at 1920x1080

## Architecture

```
dembrandt/
├── index.js              # CLI entry point, command handling
├── lib/
│   ├── extractors.js     # Core extraction logic with stealth mode
│   └── display.js        # Terminal output formatting
├── output/               # Auto-saved JSON extractions (gitignored)
│   ├── stripe.com/
│   │   ├── 2025-11-22T14-30-45.json
│   │   └── 2025-11-22T15-12-33.json
│   └── github.com/
│       └── 2025-11-22T14-35-12.json
├── package.json
└── README.md
```

## License

MIT

## Contributing

Issues and pull requests welcome. Please include:
- Clear description of the issue/feature
- Example URLs that demonstrate the problem
- Expected vs actual behavior

## Roadmap

- [ ] Dark mode detection and extraction
- [ ] Animation/transition detection
- [ ] Interactive state capture (hover, focus, active)
- [ ] Multi-page analysis
- [ ] Configuration file support
