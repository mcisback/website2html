# Website2HTML

Fetches a web page and outputs the HTML
content to stdout. Supports cookie loading and screenshot capture.

```txt
Options:
  -u, --url <url>           URL to fetch (can also be passed as positional arg)
  -c, --loadcookies <file>  Path to JSON file containing cookies to load
  -s, --screenshot <file>   Save a screenshot to the specified path
  -v, --verbose             Enable verbose output
  -n, --noheadless          Run browser in non-headless mode (visible window)
  -h, --help                Show this help message
```

## Basic usage - fetch a page and output HTML
```
website2html.js https://example.com 
```

## Save HTML to a file
```
website2html.js https://example.com > page.html
```

## Take a screenshot
```
website2html.js -s screenshot.png https://example.com
```

## Load cookies from a JSON file
```
website2html.js -c cookies.json https://example.com
```

## Set User Agent
```
website2html.js -a "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3" https://example.com
```

## Combine options
```
website2html.js -c cookies.json -s shot.png -v https://example.com
```

## Cookie file format:
The cookie file should be a JSON array of cookie objects:
```json
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
```
