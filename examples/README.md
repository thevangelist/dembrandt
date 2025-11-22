# Dembrandt Examples

This folder contains real-world examples of design token extraction from popular websites. Each JSON file demonstrates Dembrandt's ability to extract colors, typography, spacing, shadows, and component styles from production sites.

## Examples

### 1. [material.io.json](material.io.json) - Google Material Design 3

**Why this matters:** Google's Material Design is the foundation for Android and countless web apps. This extraction captures Material 3's latest design tokens.

**Key findings:**
- **Primary color**: `rgb(100, 66, 214)` - Material's signature purple
- **Typography**: Google Sans & Google Sans Text font families
  - Display: 96px / 6rem (h1)
  - Headline: 57px / 3.56rem (h2)
  - Body: 16px / 1rem with 500 weight for links
- **Spacing scale**: 8px base grid system (8px, 16px, 24px, 32px, 64px, 96px)
- **Border radius**: 24px (high confidence), 16px, 4px - Material's rounded corners
- **Components**: 3 button variants detected
  - Primary: Purple fill (`rgb(100, 66, 214)`) with 48px border radius
  - Container: Light purple background
  - Text-only: Transparent background

**Design system characteristics:**
- Clean, semantic color palette with 15 unique colors
- CSS variables for theming (`--mio-theme-color-*`)
- 6 responsive breakpoints (600px, 960px, 1294px)
- Bootstrap framework patterns detected

---

### 2. [carbon.design.json](carbon.design.json) - IBM Carbon Design System

**Why this matters:** IBM Carbon is built for enterprise applications with accessibility and consistency at its core. Perfect example of a mature, production design system.

**Key findings:**
- **Color palette**: Enterprise-grade neutrals
  - Primary: `rgb(0, 0, 0)` - 272 instances
  - Gray scale: `rgb(40, 40, 40)` (197 instances), `rgb(78, 78, 78)` (71 instances)
  - Minimal accent colors - enterprise aesthetic
- **Typography**: IBM Plex family
  - Sans: 32px / 2rem (medium weight)
  - Mono: 14px / 0.875rem (400 weight) - for code/data
  - Text: 16px / 1rem - body text
- **Spacing scale**: Conservative, accessible spacing
  - 8px, 16px, 24px, 32px (4px not as prominent as Material)
- **Components**: Minimal button styles (1 variant) - emphasizes function over form

**Design system characteristics:**
- Highly accessible (10 unique colors, high contrast)
- 2 frameworks detected (React + custom components)
- Professional, minimal aesthetic
- Perfect for data-heavy enterprise UIs

---

### 3. [stripe.com.json](stripe.com.json) - Stripe Payment Platform

**Why this matters:** Stripe's design is polished, conversion-focused, and represents modern SaaS UI best practices.

**Key findings:**
- **Rich color palette**: 57 unique colors (most diverse of the three)
  - Primary text: `rgb(66, 84, 102)` - 3,685 instances (slate blue)
  - Accent blues and purples throughout
  - Professional yet friendly color scheme
- **Typography**: Custom sans-serif stack
  - 21 distinct typography styles (most complex)
  - Range from 12px to 80px
  - Sophisticated type scale for marketing + product
- **Spacing scale**: 20 unique spacing values
  - Fine-grained control for pixel-perfect layouts
  - Mix of 4px and 8px base increments
- **Border radius**: 28 different radius values
  - Highly polished, consistent rounding
  - Ranges from subtle (2px) to prominent (24px+)
- **Shadows**: 14 shadow variants
  - Sophisticated depth system
  - Elevates CTAs and cards
- **Components**: Rich component library
  - 1 button variant, 1 input style detected
  - SVG logo extracted (60x25px)
- **Responsive**: 13 breakpoints - fine-tuned responsive design
- **Icons**: 1 icon system detected

**Design system characteristics:**
- Most comprehensive extraction (101KB content analyzed)
- Production-grade component library
- Conversion-optimized design (fintech trust signals)
- No framework detected (custom implementation)

---

## Comparison Table

| Metric | Material.io | Carbon.design | Stripe.com |
|--------|------------|---------------|------------|
| **Colors** | 15 | 10 | 57 |
| **Typography Styles** | 10 | 3 | 21 |
| **Spacing Values** | 13 | 5 | 20 |
| **Border Radius** | 8 | 1 | 28 |
| **Shadows** | 1 | 0 | 14 |
| **Buttons** | 3 | 1 | 1 |
| **Breakpoints** | 6 | 0 | 13 |
| **Design Philosophy** | Consumer-friendly, bold | Enterprise, accessible | Conversion-focused, polished |

---

## How These Were Generated

Each example was generated with a single command:

```bash
npx dembrandt material.io --json-only > examples/material.io.json
npx dembrandt carbon.design --json-only > examples/carbon.design.json
npx dembrandt stripe.com --json-only > examples/stripe.com.json
```

**Key capabilities demonstrated:**
- ✅ Automatic redirect handling (material.io → m3.material.io)
- ✅ SPA hydration detection (8-second wait for JavaScript-heavy sites)
- ✅ Component analysis (buttons, inputs, etc.)
- ✅ Framework detection (Bootstrap, React)
- ✅ Logo extraction (SVG dimensions)
- ✅ Responsive breakpoint discovery
- ✅ CSS variable extraction

---

## What You Can Do With These

**For designers:**
- Import color palettes into Figma/Sketch
- Understand competitor design systems
- Build design system documentation

**For developers:**
- Generate Tailwind configs from extracted tokens
- Audit brand consistency across sites
- Reverse-engineer spacing scales for your own projects

**For product teams:**
- Competitive analysis of design patterns
- Build design system guidelines
- Document existing implementations

---

## Try It Yourself

```bash
# Extract any site (no installation needed!)
npx dembrandt yoursite.com

# Export as JSON
npx dembrandt yoursite.com --json-only > tokens.json
```

---

**🎨 These examples showcase how Dembrandt extracts production design tokens without requiring API access or authentication - just a URL.**
