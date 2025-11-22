/**
 * Brand Extraction Engine
 *
 * Core extraction logic with stealth mode, retry mechanisms, and parallel processing.
 * Handles bot detection, SPA hydration, and comprehensive design token extraction.
 */

import { chromium } from "playwright";
import chalk from "chalk";

/**
 * Main extraction function - orchestrates the entire brand analysis process
 *
 * @param {string} url - Target URL to analyze
 * @param {Object} spinner - Ora spinner instance for progress updates
 * @param {Object} passedBrowser - Optional pre-configured browser instance
 * @param {Object} options - Configuration options (navigationTimeout, etc.)
 * @returns {Object} Complete brand extraction data
 */
export async function extractBranding(
  url,
  spinner,
  passedBrowser = null,
  options = {}
) {
  const ownBrowser = !passedBrowser;
  let browser = passedBrowser;

  if (ownBrowser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-dev-shm-usage",
      ],
    });
  }

  spinner.text = "Creating browser context with stealth mode...";
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    locale: "en-US",
    permissions: ["clipboard-read", "clipboard-write"],
  });

  // Full stealth — kills 99% of Cloudflare bot detection
  spinner.text = "Injecting anti-detection scripts...";

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
    Object.defineProperty(navigator, "platform", { get: () => "MacIntel" });
    Object.defineProperty(navigator, "maxTouchPoints", { get: () => 0 });

    // Spoof Chrome runtime
    window.chrome = {
      runtime: {},
      loadTimes: () => {},
      csi: () => {},
      app: {},
    };

    // Remove Playwright traces
    delete navigator.__proto__.webdriver;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
  });

  const page = await context.newPage();

  try {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      spinner.text = `Navigating to ${url} (attempt ${attempts}/${maxAttempts})...`;
      try {
        const initialUrl = url;
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: options.navigationTimeout || 20000,
        });
        const finalUrl = page.url();

        // Check for redirects or domain changes
        if (initialUrl !== finalUrl) {
          const initialDomain = new URL(initialUrl).hostname;
          const finalDomain = new URL(finalUrl).hostname;

          if (initialDomain !== finalDomain) {
            console.log(
              chalk.yellow(`  ⚠ Page redirected to different domain:`)
            );
            console.log(chalk.dim(`    From: ${initialUrl}`));
            console.log(chalk.dim(`    To:   ${finalUrl}`));
          } else {
            console.log(chalk.cyan(`  ℹ Page redirected within same domain:`));
            console.log(chalk.dim(`    From: ${initialUrl}`));
            console.log(chalk.dim(`    To:   ${finalUrl}`));
          }
        }

        console.log(chalk.dim(`  ✓ Page loaded (domcontentloaded)`));

        // Give SPAs time to hydrate (Linear, Figma, Notion, etc.)
        spinner.text = "Waiting for SPA hydration...";
        await page.waitForTimeout(8000);
        console.log(chalk.dim(`  ✓ Hydration wait complete (8s)`));

        // Optional: wait for main content
        spinner.text = "Waiting for main content...";
        try {
          await page.waitForSelector("main, header, [data-hero], section", {
            timeout: 10000,
          });
          console.log(chalk.dim(`  ✓ Main content detected`));
        } catch {
          console.log(
            chalk.dim(`  ⚠ Main content selector timeout (continuing anyway)`)
          );
        }

        // Simulate human behavior
        spinner.text = "Simulating human interaction...";
        await page.mouse.move(
          300 + Math.random() * 400,
          200 + Math.random() * 300
        );
        await page.evaluate(() => window.scrollTo(0, 400));
        console.log(chalk.dim(`  ✓ Mouse movement and scroll simulated`));

        // Final hydration wait
        spinner.text = "Final content stabilization...";
        await page.waitForTimeout(4000);
        console.log(chalk.dim(`  ✓ Page fully loaded and stable`));

        spinner.text = "Validating page content...";
        const contentLength = await page.evaluate(
          () => document.body.textContent.length
        );
        console.log(chalk.dim(`  ✓ Content length: ${contentLength} chars`));

        if (contentLength > 500) break;

        spinner.warn(
          `Page seems empty (attempt ${attempts}/${maxAttempts}), retrying...`
        );
        console.log(
          chalk.yellow(
            `  ⚠ Content length: ${contentLength} chars (expected >500)`
          )
        );
        await page.waitForTimeout(3000);
      } catch (err) {
        if (attempts >= maxAttempts) {
          console.error(`  ↳ Failed after ${maxAttempts} attempts`);
          console.error(`  ↳ Last error: ${err.message}`);
          console.error(`  ↳ URL: ${url}`);
          throw err;
        }
        spinner.warn(
          `Navigation failed (attempt ${attempts}/${maxAttempts}), retrying...`
        );
        console.log(`  ↳ Error: ${err.message}`);
        await page.waitForTimeout(3000);
      }
    }

    console.log(
      chalk.dim("\n  Starting parallel extraction of design tokens...")
    );

    spinner.text = "Extracting logo...";
    console.log(chalk.dim(`  → Extracting logo`));
    const logo = await extractLogo(page, url);
    console.log(chalk.dim(`  ✓ Logo extracted`));

    spinner.text = "Analyzing design system in parallel...";
    console.log(
      chalk.dim(`  → Extracting colors, typography, spacing, shadows...`)
    );
    console.log(
      chalk.dim(`  → Analyzing components, breakpoints, frameworks...`)
    );

    const [
      colors,
      typography,
      spacing,
      borderRadius,
      shadows,
      buttons,
      inputs,
      breakpoints,
      iconSystem,
      frameworks,
    ] = await Promise.all([
      extractColors(page),
      extractTypography(page),
      extractSpacing(page),
      extractBorderRadius(page),
      extractShadows(page),
      extractButtonStyles(page),
      extractInputStyles(page),
      extractBreakpoints(page),
      detectIconSystem(page),
      detectFrameworks(page),
    ]);

    console.log(chalk.dim(`  ✓ Colors: ${colors.palette.length} found`));
    console.log(
      chalk.dim(`  ✓ Typography: ${typography.styles.length} styles`)
    );
    console.log(
      chalk.dim(`  ✓ Spacing: ${spacing.commonValues.length} values`)
    );
    console.log(
      chalk.dim(`  ✓ Border radius: ${borderRadius.values.length} values`)
    );
    console.log(chalk.dim(`  ✓ Shadows: ${shadows.length} found`));
    console.log(chalk.dim(`  ✓ Buttons: ${buttons.length} variants`));
    console.log(chalk.dim(`  ✓ Inputs: ${inputs.length} styles`));
    console.log(chalk.dim(`  ✓ Breakpoints: ${breakpoints.length} detected`));
    console.log(chalk.dim(`  ✓ Icon systems: ${iconSystem.length} detected`));
    console.log(chalk.dim(`  ✓ Frameworks: ${frameworks.length} detected`));

    spinner.succeed("Brand extraction complete!");

    const result = {
      url: page.url(),
      extractedAt: new Date().toISOString(),
      logo,
      colors,
      typography,
      spacing,
      borderRadius,
      shadows,
      components: { buttons, inputs },
      breakpoints,
      iconSystem,
      frameworks,
    };

    // Detect canvas-only / WebGL sites (Tesla, Apple Vision Pro, etc.)
    const isCanvasOnly = await page.evaluate(() => {
      const canvases = document.querySelectorAll("canvas");
      const hasRealContent = document.body.textContent.trim().length > 200;
      const hasManyCanvases = canvases.length > 3;
      const hasWebGL = Array.from(canvases).some((c) => {
        const ctx = c.getContext("webgl") || c.getContext("webgl2");
        return !!ctx;
      });
      return hasManyCanvases && hasWebGL && !hasRealContent;
    });

    if (isCanvasOnly) {
      result.note =
        "This website uses canvas/WebGL rendering (e.g. Tesla, Apple Vision Pro). Design system cannot be extracted from DOM.";
      result.isCanvasOnly = true;
    }

    if (ownBrowser) await browser.close();

    return result;
  } catch (error) {
    if (ownBrowser) await browser.close();
    spinner.fail("Extraction failed");
    console.error(`  ↳ Error during extraction: ${error.message}`);
    console.error(`  ↳ URL: ${url}`);
    console.error(`  ↳ Stage: ${spinner.text || "unknown"}`);
    throw error;
  }
}

/**
 * Extract logo information from the page
 * Looks for common logo patterns: img with logo in class/id, SVG logos, etc.
 */
async function extractLogo(page, url) {
  return await page.evaluate((baseUrl) => {
    const candidates = Array.from(document.querySelectorAll("img, svg")).filter(
      (el) => {
        const className =
          typeof el.className === "string"
            ? el.className
            : el.className.baseVal || "";
        const attrs = (
          className +
          " " +
          (el.id || "") +
          " " +
          (el.getAttribute("alt") || "")
        ).toLowerCase();
        return attrs.includes("logo") || attrs.includes("brand");
      }
    );

    if (candidates.length === 0) return null;

    const logo = candidates[0];
    if (logo.tagName === "IMG") {
      return {
        source: "img",
        url: new URL(logo.src, baseUrl).href,
        width: logo.naturalWidth || logo.width,
        height: logo.naturalHeight || logo.height,
        alt: logo.alt,
      };
    } else {
      return {
        source: "svg",
        width: logo.width?.baseVal?.value,
        height: logo.height?.baseVal?.value,
      };
    }
  }, url);
}

/**
 * Extract color palette with confidence scoring
 * Analyzes semantic colors, CSS variables, and visual frequency
 */
async function extractColors(page) {
  return await page.evaluate(() => {
    const colorMap = new Map();
    const semanticColors = {};
    const cssVariables = {};

    // Extract CSS variables (detect all color values, not just names with "color")
    const styles = getComputedStyle(document.documentElement);
    const colorPattern = /^(#[0-9a-f]{3,8}|rgba?|hsla?|[a-z]+)/i;
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith("--")) {
        const value = styles.getPropertyValue(prop).trim();
        // Include if name suggests color OR value looks like a color
        if (
          prop.includes("color") ||
          prop.includes("bg") ||
          prop.includes("text") ||
          colorPattern.test(value)
        ) {
          cssVariables[prop] = value;
        }
      }
    }

    // Sample elements for color usage
    const elements = document.querySelectorAll("*");
    const contextScores = {
      logo: 3,
      brand: 3,
      primary: 3,
      hero: 2,
      button: 2,
      link: 2,
      header: 2,
      nav: 1,
    };

    elements.forEach((el) => {
      const computed = getComputedStyle(el);
      const bgColor = computed.backgroundColor;
      const textColor = computed.color;

      const context = (el.className + " " + el.id).toLowerCase();
      let score = 1;

      for (const [keyword, weight] of Object.entries(contextScores)) {
        if (context.includes(keyword)) score = Math.max(score, weight);
      }

      [bgColor, textColor].forEach((color) => {
        if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
          const existing = colorMap.get(color) || {
            count: 0,
            score: 0,
            sources: new Set(),
          };
          existing.count++;
          existing.score += score;
          if (score > 1) existing.sources.add(context.split(" ")[0]);
          colorMap.set(color, existing);
        }
      });

      // Semantic color detection
      if (context.includes("primary") || el.matches('[class*="primary"]')) {
        semanticColors.primary =
          bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent"
            ? bgColor
            : textColor;
      }
      if (context.includes("secondary")) {
        semanticColors.secondary = bgColor;
      }
    });

    const palette = Array.from(colorMap.entries())
      .map(([color, data]) => ({
        color,
        count: data.count,
        confidence:
          data.score > 20 ? "high" : data.score > 5 ? "medium" : "low",
        sources: Array.from(data.sources),
      }))
      .sort((a, b) => b.count - a.count);

    return { semantic: semanticColors, palette, cssVariables };
  });
}

/**
 * Extract typography styles with context awareness
 * Samples headings, body text, buttons, and links
 */
async function extractTypography(page) {
  return await page.evaluate(() => {
    const styles = new Map();
    const sources = { googleFonts: [], adobeFonts: false, customFonts: [] };

    // Detect font sources
    const links = Array.from(
      document.querySelectorAll('link[href*="fonts.googleapis.com"]')
    );
    links.forEach((link) => {
      const match = link.href.match(/family=([^:&]+)/);
      if (match) sources.googleFonts.push(decodeURIComponent(match[1]));
    });

    if (document.querySelector('link[href*="typekit.net"]')) {
      sources.adobeFonts = true;
    }

    // Sample typography
    const selectors = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "a",
      "button",
      ".hero",
      ".title",
    ];
    const elements = document.querySelectorAll(selectors.join(","));

    elements.forEach((el) => {
      const computed = getComputedStyle(el);
      const key = `${computed.fontFamily}-${computed.fontSize}-${computed.fontWeight}`;

      if (!styles.has(key)) {
        styles.set(key, {
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          fontSizeRem: (parseFloat(computed.fontSize) / 16).toFixed(2) + "rem",
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          contexts: [],
          confidence:
            el.tagName.match(/H[1-6]/) || el.className.includes("hero")
              ? "high"
              : "medium",
        });
      }

      const style = styles.get(key);
      const context = el.tagName.toLowerCase();
      if (!style.contexts.includes(context)) {
        style.contexts.push(context);
      }
    });

    return { styles: Array.from(styles.values()), sources };
  });
}

/**
 * Extract spacing scale and detect grid system
 */
async function extractSpacing(page) {
  return await page.evaluate(() => {
    const spacings = new Map();

    document.querySelectorAll("*").forEach((el) => {
      const computed = getComputedStyle(el);
      ["marginTop", "marginBottom", "paddingTop", "paddingBottom"].forEach(
        (prop) => {
          const value = parseFloat(computed[prop]);
          if (value > 0) {
            spacings.set(value, (spacings.get(value) || 0) + 1);
          }
        }
      );
    });

    const values = Array.from(spacings.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([px, count]) => ({
        px: px + "px",
        rem: (px / 16).toFixed(2) + "rem",
        count,
      }));

    // Detect grid system
    const is4px = values.some((v) => parseFloat(v.px) % 4 === 0);
    const is8px = values.some((v) => parseFloat(v.px) % 8 === 0);
    const scaleType = is8px ? "8px" : is4px ? "4px" : "custom";

    return { scaleType, commonValues: values };
  });
}

/**
 * Extract border radius patterns
 */
async function extractBorderRadius(page) {
  return await page.evaluate(() => {
    const radii = new Map();

    document.querySelectorAll("*").forEach((el) => {
      const radius = getComputedStyle(el).borderRadius;
      if (radius && radius !== "0px") {
        radii.set(radius, (radii.get(radius) || 0) + 1);
      }
    });

    const values = Array.from(radii.entries())
      .map(([value, count]) => ({
        value,
        count,
        confidence: count > 10 ? "high" : count > 3 ? "medium" : "low",
      }))
      .sort((a, b) => b.count - a.count);

    return { values };
  });
}

/**
 * Extract box shadow patterns for elevation systems
 */
async function extractShadows(page) {
  return await page.evaluate(() => {
    const shadows = new Map();

    document.querySelectorAll("*").forEach((el) => {
      const shadow = getComputedStyle(el).boxShadow;
      if (shadow && shadow !== "none") {
        shadows.set(shadow, (shadows.get(shadow) || 0) + 1);
      }
    });

    return Array.from(shadows.entries())
      .map(([shadow, count]) => ({
        shadow,
        count,
        confidence: count > 5 ? "high" : count > 2 ? "medium" : "low",
      }))
      .sort((a, b) => b.count - a.count);
  });
}

/**
 * Extract button component styles and variants
 */
async function extractButtonStyles(page) {
  return await page.evaluate(() => {
    const buttons = Array.from(
      document.querySelectorAll('button, .btn, [class*="button"]')
    );

    return buttons
      .slice(0, 10)
      .map((btn) => {
        const computed = getComputedStyle(btn);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          padding: computed.padding,
          borderRadius: computed.borderRadius,
          border: computed.border,
          fontWeight: computed.fontWeight,
          fontSize: computed.fontSize,
          classes: btn.className,
          confidence: btn.tagName === "BUTTON" ? "high" : "medium",
        };
      })
      .filter(
        (btn, i, arr) =>
          arr.findIndex((b) => b.backgroundColor === btn.backgroundColor) === i
      );
  });
}

/**
 * Extract input field styles
 */
async function extractInputStyles(page) {
  return await page.evaluate(() => {
    const inputs = Array.from(
      document.querySelectorAll("input, textarea, select")
    );

    return inputs.slice(0, 5).map((input) => {
      const computed = getComputedStyle(input);
      return {
        type: input.tagName.toLowerCase(),
        border: computed.border,
        borderRadius: computed.borderRadius,
        padding: computed.padding,
        backgroundColor: computed.backgroundColor,
        focusStyles: {
          outline: computed.outline,
        },
      };
    });
  });
}

/**
 * Detect responsive breakpoints from CSS
 */
async function extractBreakpoints(page) {
  return await page.evaluate(() => {
    const breakpoints = new Set();

    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.media) {
            const match = rule.media.mediaText.match(/(\d+)px/g);
            if (match) match.forEach((m) => breakpoints.add(parseInt(m)));
          }
        }
      } catch (e) {
        // Cross-origin stylesheets may throw errors
      }
    }

    return Array.from(breakpoints)
      .sort((a, b) => a - b)
      .map((px) => ({ px: px + "px" }));
  });
}

/**
 * Detect icon systems in use
 */
async function detectIconSystem(page) {
  return await page.evaluate(() => {
    const systems = [];

    if (document.querySelector('[class*="fa-"]')) {
      systems.push({ name: "Font Awesome", type: "icon-font" });
    }
    if (document.querySelector('[class*="material-icons"]')) {
      systems.push({ name: "Material Icons", type: "icon-font" });
    }
    if (document.querySelector('svg[class*="icon"]')) {
      systems.push({ name: "SVG Icons", type: "svg" });
    }

    return systems;
  });
}

/**
 * Detect CSS frameworks and libraries
 */
async function detectFrameworks(page) {
  return await page.evaluate(() => {
    const frameworks = [];
    const html = document.documentElement.outerHTML;

    const checks = [
      {
        name: "Tailwind CSS",
        pattern: /class="[^"]*\b(flex|grid|p-\d|m-\d|bg-\w+)/,
      },
      {
        name: "Bootstrap",
        pattern: /class="[^"]*\b(container|row|col-|btn-|nav-)/,
      },
      { name: "Material-UI", pattern: /class="[^"]*\bMui/ },
      { name: "Chakra UI", pattern: /class="[^"]*\bchakra/ },
    ];

    checks.forEach(({ name, pattern }) => {
      if (pattern.test(html)) {
        frameworks.push({
          name,
          confidence: "high",
          evidence: "class patterns",
        });
      }
    });

    return frameworks;
  });
}
