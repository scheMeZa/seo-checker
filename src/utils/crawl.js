const puppeteer = require('puppeteer');
const { URL } = require('url');

/**
 * Crawls a page and returns all unique internal links found on the page.
 * @param {string} pageUrl - The URL of the page to crawl.
 * @returns {Promise<string[]>} - Array of unique internal links (absolute URLs).
 */
async function crawlPageLinks(pageUrl) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });

  // Get all hrefs from <a> tags
  const links = await page.$$eval('a[href]', (as) => as.map((a) => a.href));

  // Filter to only internal links (same origin)
  const origin = new URL(pageUrl).origin;
  const uniqueLinks = Array.from(
    new Set(
      links
        .map((link) => {
          try {
            return new URL(link, origin).href;
          } catch {
            return null;
          }
        })
        .filter((href) => href && href.startsWith(origin))
    )
  );

  await browser.close();
  return uniqueLinks;
}

// Helper to normalize URLs for deduplication (removes hash, normalizes trailing slash, lowercases protocol/host)
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    // Remove trailing slash except for root
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.replace(/\/+$/, '');
    }
    // Lowercase protocol and host
    u.protocol = u.protocol.toLowerCase();
    u.host = u.host.toLowerCase();
    return u.toString();
  } catch {
    return url.split('#')[0].replace(/\/+$/, '');
  }
}

/**
 * Recursively crawls a site for internal links up to a limit.
 * @param {string} startUrl - The starting URL.
 * @param {number} [limit] - Max number of unique pages to crawl.
 * @param {function} [onDiscovered] - Optional callback called with each new discovered link.
 * @returns {Promise<string[]>} - Array of unique internal links (absolute URLs).
 */
async function crawlSiteRecursive(startUrl, limit, onDiscovered) {
  limit = limit || parseInt(process.env.CRAWL_DEPTH, 10) || 100;
  const concurrency = parseInt(process.env.QUEUE_CONCURRENCY, 10) || 5;
  const origin = new URL(startUrl).origin;
  const visited = new Set();
  const toVisit = [startUrl];

  const browser = await puppeteer.launch({ headless: 'new' });

  while (toVisit.length > 0 && visited.size < limit) {
    // Take up to N URLs for this batch
    const batch = [];
    while (batch.length < concurrency && toVisit.length > 0 && visited.size + batch.length < limit) {
      const url = toVisit.shift();
      const normUrl = normalizeUrl(url);
      if (!visited.has(normUrl)) {
        batch.push({ url, normUrl });
      }
    }
    if (batch.length === 0) break;
    await Promise.all(batch.map(async ({ url, normUrl }) => {
      visited.add(normUrl);
      if (onDiscovered) {
        await onDiscovered(normUrl);
      }
      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        const links = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
        const internalLinks = Array.from(
          new Set(
            links
              .map((link) => {
                try {
                  return normalizeUrl(new URL(link, origin).href);
                } catch {
                  return null;
                }
              })
              .filter((href) => href && href.startsWith(origin))
          )
        );
        for (const link of internalLinks) {
          if (!visited.has(link) && !toVisit.includes(link) && visited.size + toVisit.length + batch.length < limit) {
            toVisit.push(link);
          }
        }
        await page.close();
      } catch (err) {
        // Ignore errors for individual pages
      }
    }));
  }

  await browser.close();
  return Array.from(visited);
}

module.exports = { crawlPageLinks, crawlSiteRecursive }; 