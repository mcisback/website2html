#!/usr/bin/env node
/**
 * website2html.js - A Puppeteer-based web page fetcher
 */

const fs = require("fs");
const path = require("path");
const { parseArgs } = require("node:util");

function usage() {
  console.log(`
Usage: website2html.js [options] <url>

Fetches a web page and outputs the HTML
content to stdout. Supports cookie loading and screenshot capture.

Options:
  -u, --url <url>           URL to fetch (can also be passed as positional arg)
  -c, --loadcookies <file>  Path to JSON file containing cookies to load
  -s, --screenshot <file>   Save a screenshot to the specified path
  -a, --user-agent <user_agent_string>   Set the user agent
  -v, --verbose             Enable verbose output
  -n, --noheadless          Run browser in non-headless mode (visible window)
  -h, --help                Show this help message

Examples:
  # Basic usage - fetch a page and output HTML
  website2html.js https://example.com

  # Save HTML to a file
  website2html.js https://example.com > page.html

  # Take a screenshot
  website2html.js -s screenshot.png https://example.com

  # Load cookies from a JSON file
  website2html.js -c cookies.json https://example.com

  # Combine options
  website2html.js -c cookies.json -s shot.png -v https://example.com

Cookie file format:
  The cookie file should be a JSON array of cookie objects:
  [
    {
      "name": "session",
      "value": "abc123",
      "domain": ".example.com",
      "path": "/",
      "httpOnly": true,
      "secure": true
    }
  ]
`);
  process.exit(0);
}

// Parse command line arguments
let values, positionals;
try {
  ({ values, positionals } = parseArgs({
    options: {
      url: {
        type: "string",
        short: "u",
      },
      loadcookies: {
        type: "string",
        short: "c",
      },
      screenshot: {
        type: "string",
        short: "s",
      },
      userAgent: {
        type: "string",
        short: "a",
      },
      verbose: {
        type: "boolean",
        short: "v",
        default: false,
      },
      noheadless: {
        type: "boolean",
        short: "n",
        default: false,
      },
      help: {
        type: "boolean",
        short: "h",
        default: false,
      },
    },
    allowPositionals: true,
  }));
} catch (err) {
  console.error(`Error parsing arguments: ${err.message}`);
  process.exit(1);
}

if (values.help) {
  usage();
}

const url = positionals[0] ?? values.url;
let loadCookies = values.loadcookies ?? false;
const screenshot = values.screenshot ?? false;
const userAgent = values.userAgent ?? null;
const verbose = values.verbose;
const headless = values.noheadless ? false : "new";

// Validate URL
if (!url) {
  console.error("Error: No URL provided\n");
  usage();
}

// Validate and resolve cookie file path
if (loadCookies) {
  if (path.isAbsolute(loadCookies)) {
    if (!fs.existsSync(loadCookies)) {
      console.error(`Error: Cannot find cookie file "${loadCookies}"`);
      process.exit(1);
    }
  } else {
    const resolvedPath = path.join(process.cwd(), loadCookies);
    if (fs.existsSync(resolvedPath)) {
      loadCookies = resolvedPath;
    } else {
      console.error(`Error: Cannot find cookie file "${resolvedPath}"`);
      process.exit(1);
    }
  }
}

if (verbose) {
  console.error("Configuration:");
  console.error(`  URL: ${url}`);
  console.error(`  Cookies: ${loadCookies || "none"}`);
  console.error(`  Screenshot: ${screenshot || "none"}`);
  console.error(`  Headless: ${headless}`);
}

if (userAgent && verbose) {
  console.error(`Using User Agent: ${userAgent}`);
}

const puppeteer = require("puppeteer");

(async () => {
  try {
    if (verbose) console.error("Launching browser...");

    const browser = await puppeteer.launch({
      headless: headless,
      // Uncomment to use Tor:
      // args: ['--proxy-server=socks5://127.0.0.1:9050']
    });

    const page = await browser.newPage();
    if (userAgent) {
      await page.setUserAgent(userAgent);
    }

    // Load cookies if provided
    if (loadCookies) {
      if (verbose) console.error(`Loading cookies from ${loadCookies}...`);
      const cookies = require(loadCookies);
      await page.setCookie(...cookies);
    }

    // Navigate to URL
    if (verbose) console.error(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "load" });

    // Take screenshot if requested
    if (screenshot) {
      if (verbose) console.error(`Saving screenshot to ${screenshot}...`);
      await page.screenshot({ path: screenshot });
    }

    // Output page HTML
    const html = await page.content();
    console.log(html);

    await browser.close();

    if (verbose) console.error("Done.");
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
