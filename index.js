#!/usr/bin/env node

/**
 * Dembrandt - Design Token Extraction CLI
 *
 * Extracts design tokens, brand colors, typography, spacing, and component styles
 * from any website using Playwright with advanced bot detection avoidance.
 */

import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { chromium } from "playwright";
import { extractBranding } from "./lib/extractors.js";
import { displayResults } from "./lib/display.js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

program
  .name("dembrandt")
  .description("Extract design tokens from any website")
  .version("1.0.0")
  .argument("<url>")
  .option("--json-only", "Output raw JSON")
  .option("-d, --debug", "Force visible browser")
  .action(async (input, opts) => {
    let url = input;
    if (!url.match(/^https?:\/\//)) url = "https://" + url;

    const spinner = ora("Starting extraction...").start();
    let browser = null;

    try {
      let useHeaded = opts.debug;
      let result;

      while (true) {
        spinner.text = `Launching browser (${
          useHeaded ? "visible" : "headless"
        } mode)`;
        browser = await chromium.launch({
          headless: !useHeaded,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled",
          ],
        });
        if (opts.debug) {
          console.log(
            chalk.dim(
              `  ✓ Browser launched in ${
                useHeaded ? "visible" : "headless"
              } mode`
            )
          );
        }

        try {
          result = await extractBranding(url, spinner, browser, {
            navigationTimeout: 90000,
          });
          break;
        } catch (err) {
          await browser.close();
          browser = null;

          if (useHeaded) throw err;

          if (
            err.message.includes("Timeout") ||
            err.message.includes("net::ERR_")
          ) {
            spinner.warn(
              "Bot detection detected → retrying with visible browser"
            );
            console.error(chalk.dim(`  ↳ Error: ${err.message}`));
            console.error(chalk.dim(`  ↳ URL: ${url}`));
            console.error(chalk.dim(`  ↳ Mode: headless`));
            useHeaded = true;
            continue;
          }
          throw err;
        }
      }

      spinner.succeed("Done!");

      // Save JSON output automatically (unless --json-only)
      if (!opts.jsonOnly) {
        try {
          const domain = new URL(url).hostname.replace("www.", "");
          const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, "-")
            .split(".")[0];
          const outputDir = join(__dirname, "output", domain);
          mkdirSync(outputDir, { recursive: true });

          const filename = `${timestamp}.json`;
          const filepath = join(outputDir, filename);
          writeFileSync(filepath, JSON.stringify(result, null, 2));

          console.log(
            chalk.dim(
              `\n💾 JSON saved to: ${chalk.cyan(`output/${domain}/${filename}`)}`
            )
          );
        } catch (err) {
          console.log(chalk.yellow(`⚠ Could not save JSON file: ${err.message}`));
        }
      }

      // Output to terminal
      if (opts.jsonOnly) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        displayResults(result);
      }
    } catch (err) {
      spinner.fail("Failed");
      console.error(chalk.red("\n✗ Extraction failed"));
      console.error(chalk.red(`  Error: ${err.message}`));
      console.error(chalk.dim(`  URL: ${url}`));

      if (opts.debug && err.stack) {
        console.error(chalk.dim("\nStack trace:"));
        console.error(chalk.dim(err.stack));
      }

      if (!opts.debug) {
        console.log(
          chalk.yellow(
            "\nTip: Try with --debug flag for tough sites and detailed error logs"
          )
        );
      }
      process.exit(1);
    } finally {
      if (browser) await browser.close();
    }
  });

program.parse();
