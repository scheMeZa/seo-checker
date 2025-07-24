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

/**
 * Recursively crawls a site for internal links up to a limit.
 * @param {string} startUrl - The starting URL.
 * @param {number} [limit] - Max number of unique pages to crawl.
 * @returns {Promise<string[]>} - Array of unique internal links (absolute URLs).
 */
async function crawlSiteRecursive(startUrl, limit) {
  limit = limit || parseInt(process.env.CRAWL_DEPTH, 10) || 100;
  const origin = new URL(startUrl).origin;
  const visited = new Set();
  const toVisit = [startUrl];

  const browser = await puppeteer.launch({ headless: 'new' });

  while (toVisit.length > 0 && visited.size < limit) {
    const url = toVisit.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const links = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
      const internalLinks = Array.from(
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
      for (const link of internalLinks) {
        if (!visited.has(link) && !toVisit.includes(link) && visited.size + toVisit.length < limit) {
          toVisit.push(link);
        }
      }
      await page.close();
    } catch (err) {
      // Ignore errors for individual pages
    }
  }

  await browser.close();
  return Array.from(visited);
}

module.exports = { crawlPageLinks, crawlSiteRecursive }; 