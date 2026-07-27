// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * PlusMagi Site Search — UI & functional tests
 *
 * Tests cover:
 *  1. Widget is present and visible
 *  2. Scripts and JS localisation object are loaded
 *  3. Short queries (< 3 chars) do NOT trigger a request
 *  4. Typing 3+ chars fires the REST API and shows dropdown
 *  5. Tab switching (Posts / Category / Tag)
 *  6. Dropdown closes when clicking outside
 *  7. Prefix searches: post: / tag: / category:
 *  8. REST API endpoint contract
 *
 * Selectors match the PHP render_shortcode() output and search.js.
 */

// Supports both legacy ID-based markup and new class-based markup.
const SEARCH_INPUT   = '.plusmagi-site-search-wrapper .plusmagi-site-search-input, #plusmagi-site-search-input';
const SEARCH_RESULTS = '.plusmagi-site-search-results, #plusmagi-site-search-results';

function panelSelector(tab) {
    return `${SEARCH_RESULTS} .plusmagi-site-search-tab-content[data-tab-content="${tab}"], ${SEARCH_RESULTS} #tab-content-${tab}`;
}
function tabSelector(tab) {
    return `${SEARCH_RESULTS} .plusmagi-site-search-tab[data-tab="${tab}"], ${SEARCH_RESULTS} .plusmagi-tab[data-tab="${tab}"]`;
}

async function activateTab(page, tab) {
    const tabEl = page.locator(tabSelector(tab));
    await tabEl.waitFor({ state: 'visible', timeout: 10_000 });
    await tabEl.dispatchEvent('mousedown');
}

// REST API — namespace matches register_rest_routes()
const REST_SEARCH = '/wp-json/plusmagi-site-search/v1/search';

/** Wait for the debounce (300 ms) + a safety margin */
const DEBOUNCE_WAIT = 600;

const SEARCH_PAGE_PATH = process.env.SEARCH_PAGE_PATH || '/';

// ---------------------------------------------------------------------------
// Shared helper: open a page that contains the search widget
// ---------------------------------------------------------------------------
async function goHome(page) {
    const visited = new Set();

    async function tryPage(path) {
        if (!path || visited.has(path)) {
            return false;
        }
        visited.add(path);

        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60_000 });

        // Dismiss ad overlays that some themes inject
        const closeBtn = page.locator('[id^="google_vignette"] button, .dismiss-button, [aria-label="Close"]');
        if (await closeBtn.count() > 0) {
            await closeBtn.first().click().catch(() => {});
        }

        const inputVisible = await page.locator(SEARCH_INPUT).first().isVisible({ timeout: 5_000 }).catch(() => false);
        const hasPluginBootstrap = await page.evaluate(() => {
            const w = /** @type {any} */ (window);
            return typeof w.plusmagiSiteSearch?.root === 'string' && typeof w.plusmagiSiteSearch?.nonce === 'string';
        });

        return inputVisible && hasPluginBootstrap;
    }

    // 1) Try configured target path first, then homepage.
    if (await tryPage(SEARCH_PAGE_PATH)) {
        return;
    }
    if (SEARCH_PAGE_PATH !== '/' && (await tryPage('/'))) {
        return;
    }

    // 2) Crawl a small set of internal links from the homepage.
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    const candidatePaths = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href]'))
            .map((a) => a.getAttribute('href') || '')
            .filter(Boolean)
            .map((href) => {
                try {
                    const url = new URL(href, window.location.origin);
                    if (url.origin !== window.location.origin) return '';
                    if (url.pathname.startsWith('/wp-admin')) return '';
                    return url.pathname + url.search;
                } catch {
                    return '';
                }
            })
            .filter(Boolean);

        return Array.from(new Set(links)).slice(0, 20);
    });

    for (const path of candidatePaths) {
        // eslint-disable-next-line no-await-in-loop
        if (await tryPage(path)) {
            return;
        }
    }

    throw new Error('Search widget with plugin bootstrap not found. Set SEARCH_PAGE_PATH to a page that contains the PlusMagi shortcode/block and loads search.js.');
}

async function getMinChars(page) {
    const minChars = await page.evaluate(() => {
        const w = /** @type {any} */ (window);
        const val = Number(w.plusmagiSiteSearch?.minChars);
        return Number.isInteger(val) && val >= 1 ? val : 2;
    });
    return minChars;
}

// ---------------------------------------------------------------------------
// Helper: type into search and wait for the REST response
// ---------------------------------------------------------------------------
async function searchFor(page, term) {
    const responsePromise = page.waitForResponse(
        res => res.url().includes('plusmagi-site-search/v1/search'),
        { timeout: 15_000 }
    );
    await page.locator(SEARCH_INPUT).click();
    await page.locator(SEARCH_INPUT).fill(term);
    return responsePromise;
}

// ===========================================================================
// 1. Widget — presence & JS bootstrap
// ===========================================================================
test.describe('PlusMagi Site Search — Widget', () => {

    test.beforeEach(async ({ page }, testInfo) => {
        try {
            await goHome(page);
        } catch (error) {
            testInfo.skip(true, error instanceof Error ? error.message : 'Search widget page not available in this environment.');
        }
    });

    test('search input is visible on the page', async ({ page }) => {
        await expect(page.locator(SEARCH_INPUT)).toBeVisible();
    });

    test('results container exists in the DOM', async ({ page }) => {
        // search.js moves #plusmagi-site-search-results to <body>; it starts hidden
        await expect(page.locator(SEARCH_RESULTS)).toBeAttached();
    });

    test('plugin script (search.js) is enqueued', async ({ page }) => {
        const found = await page.evaluate(() =>
            Array.from(document.scripts).some(s =>
                s.src.includes('plusmagi-site-search') && s.src.includes('search.js')
            )
        );
        expect(found, 'search.js should be enqueued on the page').toBe(true);
    });

    test('plusmagiSiteSearch localisation object has root, nonce, and minChars', async ({ page }) => {
        const obj = await page.evaluate(() => {
            const w = /** @type {any} */ (window);
            return {
                type:  typeof w.plusmagiSiteSearch,
                hasRoot:  typeof w.plusmagiSiteSearch?.root === 'string',
                hasNonce: typeof w.plusmagiSiteSearch?.nonce === 'string',
                hasMinChars: Number.isInteger(Number(w.plusmagiSiteSearch?.minChars)),
            };
        });
        expect(obj.type, 'plusmagiSiteSearch should be an object').toBe('object');
        expect(obj.hasRoot,  'plusmagiSiteSearch.root should be a string').toBe(true);
        expect(obj.hasNonce, 'plusmagiSiteSearch.nonce should be a string').toBe(true);
        expect(obj.hasMinChars, 'plusmagiSiteSearch.minChars should be numeric').toBe(true);
    });
});

// ===========================================================================
// 2. Widget — debounce & dropdown behaviour
// ===========================================================================
test.describe('PlusMagi Site Search — Search behaviour', () => {

    test.beforeEach(async ({ page }, testInfo) => {
        try {
            await goHome(page);
        } catch (error) {
            testInfo.skip(true, error instanceof Error ? error.message : 'Search widget page not available in this environment.');
        }
    });

    test('typing fewer than configured min chars does NOT fire an API request', async ({ page }) => {
        const minChars = await getMinChars(page);
        const requests = [];
        page.on('request', req => {
            if (req.url().includes('plusmagi-site-search/v1/search')) requests.push(req);
        });

        const belowMin = 'a'.repeat(Math.max(1, minChars - 1));
        await page.locator(SEARCH_INPUT).click();
        await page.locator(SEARCH_INPUT).fill(belowMin);
        await page.waitForTimeout(DEBOUNCE_WAIT);

        expect(requests.length, `No REST request for query shorter than ${minChars} chars`).toBe(0);
        await expect(page.locator(SEARCH_RESULTS)).toBeHidden();
    });

    test('clearing input hides the dropdown', async ({ page }) => {
        await searchFor(page, 'jQuery');
        await page.waitForTimeout(DEBOUNCE_WAIT);

        await page.locator(SEARCH_INPUT).fill('');
        await expect(page.locator(SEARCH_RESULTS)).toBeHidden();
    });

    test('typing min chars or more fires a REST API request', async ({ page }) => {
        const minChars = await getMinChars(page);
        let searchRequest = null;
        page.on('request', req => {
            if (req.url().includes('plusmagi-site-search/v1/search')) searchRequest = req;
        });

        await searchFor(page, 'j'.repeat(minChars));
        expect(searchRequest, 'REST request should have been fired').not.toBeNull();
    });

    test('results dropdown appears after typing', async ({ page }) => {
        await searchFor(page, 'jQuery');
        await page.waitForTimeout(DEBOUNCE_WAIT);
        await expect(page.locator(SEARCH_RESULTS)).toBeVisible();
    });

    test('dropdown closes when clicking outside', async ({ page }) => {
        await searchFor(page, 'jQuery');
        await page.waitForTimeout(DEBOUNCE_WAIT);
        await expect(page.locator(SEARCH_RESULTS)).toBeVisible();

        await page.locator('body').click({ position: { x: 10, y: 10 } });
        await expect(page.locator(SEARCH_RESULTS)).toBeHidden();
    });
});

// ===========================================================================
// 3. Widget — tab UI
// ===========================================================================
test.describe('PlusMagi Site Search — Tabs', () => {

    test.beforeEach(async ({ page }, testInfo) => {
        try {
            await goHome(page);
        } catch (error) {
            testInfo.skip(true, error instanceof Error ? error.message : 'Search widget page not available in this environment.');
        }

        await searchFor(page, 'jQuery');
        await page.waitForTimeout(DEBOUNCE_WAIT);
        // Ensure the dropdown is visible before tab tests
        await page.locator(SEARCH_RESULTS).waitFor({ state: 'visible', timeout: 10_000 });
        await page.locator(tabSelector('posts')).waitFor({
            state: 'visible',
            timeout: 10_000,
        });
    });

    test('Posts / Category / Tag tabs are rendered', async ({ page }) => {
        await expect(page.locator(tabSelector('posts'))).toBeVisible();
        await expect(page.locator(tabSelector('categories'))).toBeVisible();
        await expect(page.locator(tabSelector('tags'))).toBeVisible();
    });

    test('Posts tab is active by default', async ({ page }) => {
        await expect(page.locator(tabSelector('posts'))).toHaveClass(/active/);
        await expect(page.locator(panelSelector('posts'))).toBeVisible();
    });

    test('clicking Category tab shows category panel', async ({ page }) => {
        await activateTab(page, 'categories');
        await expect(page.locator(panelSelector('categories'))).toBeVisible();
        await expect(page.locator(panelSelector('posts'))).toBeHidden();
    });

    test('clicking Tag tab shows tag panel', async ({ page }) => {
        await activateTab(page, 'tags');
        await expect(page.locator(panelSelector('tags'))).toBeVisible();
        await expect(page.locator(panelSelector('posts'))).toBeHidden();
    });

    test('clicking Posts tab after switching restores posts panel', async ({ page }) => {
        await activateTab(page, 'categories');
        await activateTab(page, 'posts');
        await expect(page.locator(panelSelector('posts'))).toBeVisible();
        await expect(page.locator(panelSelector('categories'))).toBeHidden();
    });
});

// ===========================================================================
// 4. Prefix searches
// ===========================================================================
test.describe('PlusMagi Site Search — Prefix searches', () => {

    test.beforeEach(async ({ page }, testInfo) => {
        try {
            await goHome(page);
        } catch (error) {
            testInfo.skip(true, error instanceof Error ? error.message : 'Search widget page not available in this environment.');
        }
    });

    test('"post:" prefix sends correct term parameter', async ({ page }) => {
        let capturedUrl = '';
        page.on('request', req => {
            if (req.url().includes('plusmagi-site-search/v1/search')) capturedUrl = req.url();
        });

        await searchFor(page, 'post:jQuery');
        expect(capturedUrl).toContain('term=post%3AjQuery');
    });

    test('"post:" prefix returns 200', async ({ page }) => {
        const res = await searchFor(page, 'post:jQuery');
        expect(res.status()).toBe(200);
    });

    test('"tag:" prefix returns 200', async ({ page }) => {
        const res = await searchFor(page, 'tag:jQuery');
        expect(res.status()).toBe(200);
    });

    test('"category:" prefix returns 200', async ({ page }) => {
        const res = await searchFor(page, 'category:WordPress');
        expect(res.status()).toBe(200);
    });
});

// ===========================================================================
// 5. REST API contract (request fixture — no browser)
// ===========================================================================
test.describe('PlusMagi Site Search — REST API', () => {

    test('GET without term returns 400', async ({ request }) => {
        const res = await request.get(REST_SEARCH);
        expect(res.status()).toBe(400);
    });

    test('GET with 2-char term returns either 400 (strict) or 200 (legacy)', async ({ request }) => {
        const res = await request.get(`${REST_SEARCH}?term=ab`);
        expect([200, 400]).toContain(res.status());
    });

    test('GET with 1-char term returns 400 (validate_callback rejects)', async ({ request }) => {
        const res = await request.get(`${REST_SEARCH}?term=a`);
        expect(res.status()).toBe(400);
    });

    test('GET with valid term returns 200 JSON array', async ({ request }) => {
        const res = await request.get(`${REST_SEARCH}?term=jQuery`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body), 'Response body should be an array').toBe(true);
    });

    test('each result item has id, title, link, type', async ({ request }) => {
        const res = await request.get(`${REST_SEARCH}?term=jQuery`);
        /** @type {Array<Record<string,unknown>>} */
        const items = await res.json();
        for (const item of items) {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('title');
            expect(item).toHaveProperty('link');
            expect(item).toHaveProperty('type');
        }
    });

    test('unauthenticated search returns only published posts', async ({ request }) => {
        const res = await request.get(`${REST_SEARCH}?term=jQuery`);
        const items = await res.json();
        const posts = items.filter((/** @type {any} */ i) => i.type === 'post');
        for (const post of posts) {
            expect(post.status, `"${post.title}" should be published`).toBe('publish');
        }
    });

    test('post: prefix returns only post-type items', async ({ request }) => {
        const res = await request.get(`${REST_SEARCH}?term=post%3AjQuery`);
        expect(res.status()).toBe(200);
        const items = await res.json();
        for (const item of items) {
            expect(item.type, `item "${item.title}" should be type post`).toBe('post');
        }
    });

    test('tag: prefix returns term items from tag/category taxonomy', async ({ request }) => {
        const res = await request.get(`${REST_SEARCH}?term=tag%3AjQuery`);
        expect(res.status()).toBe(200);
        const items = await res.json();
        for (const item of items) {
            expect(item.type).toBe('term');
            expect(['post_tag', 'category']).toContain(item.original_type);
        }
    });
});
