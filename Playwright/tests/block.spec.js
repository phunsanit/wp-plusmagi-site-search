// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * PlusMagi Site Search — Gutenberg Block tests
 *
 * These tests require WordPress admin credentials.
 * Run with the 'admin' Playwright project:
 *
 *   WP_ADMIN_PASS=secret npx playwright test --project=admin block.spec.js
 *
 * Tests cover:
 *  1. Block type is registered in the REST API
 *  2. Block appears in the Gutenberg block inserter
 *  3. Block can be inserted into a post
 *  4. Block renders a search input preview in the editor
 *  5. Saved post renders the search widget on the frontend
 */

const BLOCK_NAME  = 'plusmagi-site-search/search';
const BLOCK_TITLE = 'PlusMagi Site Search';

// ===========================================================================
// 1. REST API — block registration
// ===========================================================================
test.describe('Block registration — REST API', () => {

    /**
     * WP REST API requires the X-WP-Nonce header even for cookie-auth requests.
     * Navigate to wp-admin first so the nonce is available via wpApiSettings.
     */
    async function getAdminNonce(page) {
        await page.goto('/wp-admin/index.php', { waitUntil: 'domcontentloaded', timeout: 60_000 });
        return page.evaluate(() => {
            // eslint-disable-next-line no-undef
            return (typeof wpApiSettings !== 'undefined' && wpApiSettings.nonce) || '';
        });
    }

    test('block type is registered in /wp/v2/block-types', async ({ page }) => {
        const nonce = await getAdminNonce(page);
        const res = await page.request.get(`/wp-json/wp/v2/block-types/${BLOCK_NAME}`, {
            headers: nonce ? { 'X-WP-Nonce': nonce } : {},
        });
        expect(res.status()).toBe(200);

        const body = await res.json();
        expect(body.name).toBe(BLOCK_NAME);
        expect(typeof body.title).toBe('string');
    });

    test('block type has editorScript registered', async ({ page }) => {
        const nonce = await getAdminNonce(page);
        const res = await page.request.get(`/wp-json/wp/v2/block-types/${BLOCK_NAME}`, {
            headers: nonce ? { 'X-WP-Nonce': nonce } : {},
        });
        const body = await res.json();
        // editor_script_handles is an array; block.json sets editorScript
        const hasScript =
            Array.isArray(body.editor_script_handles) &&
            body.editor_script_handles.length > 0;
        expect(hasScript, 'block should have an editorScript handle').toBe(true);
    });
});

// ===========================================================================
// 2. Gutenberg editor — inserter & render (requires admin auth)
// ===========================================================================
test.describe('Gutenberg editor', () => {

    /**
     * Open the "new post" editor and wait for it to be ready.
     *
     * @param {import('@playwright/test').Page} page
     */
    /**
     * Returns { canvas, titleLocator, frame }.
     * Handles both classic and iframe-canvas Gutenberg modes.
     *
     * Modern WP (6.3+) loads post content inside an <iframe>.
     * Canvas = the empty-paragraph appender (role=button); title = the H1 block.
     */
    async function getEditorContext(page) {
        const isIframed = await page.locator('.edit-post-visual-editor.is-iframed').isVisible({ timeout: 3_000 }).catch(() => false);
        if (isIframed) {
            const frame = page.frameLocator('.edit-post-visual-editor iframe').first();
            // Paragraph appender: "Type / to choose a block"
            const canvas = frame.locator('p.block-editor-default-block-appender__content, [aria-label="Add default block"]').first();
            // Post title h1
            const titleLocator = frame.locator('h1.wp-block-post-title, h1[contenteditable="true"]').first();
            return { canvas, titleLocator, isIframe: true, frame };
        }
        return {
            canvas: page.locator('.block-editor-writing-flow, .block-editor-default-block-appender__content').first(),
            titleLocator: page.locator('.editor-post-title__input, h1.wp-block[data-type="core/post-title"]').first(),
            isIframe: false,
            frame: null,
        };
    }

    async function openNewPost(page) {
        await page.goto('/wp-admin/post-new.php', { waitUntil: 'domcontentloaded', timeout: 60_000 });

        // Dismiss the "Welcome to the block editor" modal if present
        const welcomeClose = page.getByRole('button', { name: /close/i }).first();
        if (await welcomeClose.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await welcomeClose.click();
        }

        // Wait for the Gutenberg editor wrapper
        await page.locator('#editor').waitFor({ state: 'visible', timeout: 30_000 });

        // Wait for the visual editor
        await page.locator('.edit-post-visual-editor').waitFor({ state: 'visible', timeout: 30_000 });

        // If using iframe canvas mode, wait for the title block inside the iframe
        const isIframed = await page.locator('.edit-post-visual-editor.is-iframed').isVisible({ timeout: 3_000 }).catch(() => false);
        if (isIframed) {
            const titleReady = page.frameLocator('.edit-post-visual-editor iframe').first().locator('h1[contenteditable="true"], h1.wp-block-post-title');
            await titleReady.waitFor({ state: 'visible', timeout: 45_000 });
        } else {
            await page.locator('.block-editor-writing-flow').waitFor({ state: 'visible', timeout: 30_000 });
        }
    }

    test('block appears in the inserter by title', async ({ page }) => {
        await openNewPost(page);

        // Open the block inserter (button label varies by WP version)
        const inserterBtn = page.locator([
            'button[aria-label*="Block Inserter"]',
            'button[aria-label*="block inserter"]',
            'button[aria-label*="Toggle block inserter"]',
        ].join(', ')).first();
        await inserterBtn.waitFor({ state: 'visible', timeout: 15_000 });
        await inserterBtn.click();

        // The inserter search input is in the main page sidebar (not in iframe)
        const inserterSearch = page.locator([
            'input[placeholder*="Search"]',
            'input[aria-label*="Search blocks"]',
            'input[aria-label*="search"]',
            '.block-editor-inserter__search input',
        ].join(', ')).first();
        await inserterSearch.waitFor({ state: 'visible', timeout: 10_000 });
        await inserterSearch.fill(BLOCK_TITLE);

        // Block should appear in the search results list
        const blockItem = page.locator(
            `[role="option"]:has-text("${BLOCK_TITLE}"), ` +
            `button:has-text("${BLOCK_TITLE}"), ` +
            `.block-editor-block-types-list__item-title:has-text("${BLOCK_TITLE}")`
        ).first();
        await expect(blockItem).toBeVisible({ timeout: 10_000 });
    });

    test('block can be inserted into the editor', async ({ page }) => {
        await openNewPost(page);
        const { canvas } = await getEditorContext(page);

        // Use the slash command to insert the block quickly
        await canvas.click();
        await page.keyboard.press('Enter');
        await page.keyboard.type('/plusmagi');

        // Autocomplete suggestion should appear (in main page, not iframe)
        const suggestion = page.locator(
            `[role="option"]:has-text("${BLOCK_TITLE}"), ` +
            `button:has-text("${BLOCK_TITLE}")`
        ).first();
        await expect(suggestion).toBeVisible({ timeout: 8_000 });
        await suggestion.click();

        // After insertion the block wrapper should be present in the editor canvas
        const { frame } = await getEditorContext(page);
        const blockWrapper = (frame ?? page).locator(
            '.wp-block-plusmagi-site-search-search, .plusmagi-site-search-editor-wrapper'
        );
        await expect(blockWrapper).toBeVisible({ timeout: 8_000 });
    });

    test('block editor preview shows search input (disabled)', async ({ page }) => {
        await openNewPost(page);
        const { canvas } = await getEditorContext(page);

        // Insert block via slash command
        await canvas.click();
        await page.keyboard.press('Enter');
        await page.keyboard.type('/plusmagi');

        const suggestion = page.locator(
            `[role="option"]:has-text("${BLOCK_TITLE}"), button:has-text("${BLOCK_TITLE}")`
        ).first();
        await suggestion.click();

        // The block edit() renders a disabled <input> as a preview
        const { frame: frame2 } = await getEditorContext(page);
        const previewInput = (frame2 ?? page).locator('.plusmagi-site-search-editor-wrapper input[disabled]');
        await expect(previewInput).toBeVisible({ timeout: 8_000 });
    });

    test('frontend renders search widget after saving the block', async ({ page }) => {
        await openNewPost(page);
        const { canvas: canvas3, titleLocator } = await getEditorContext(page);

        // Give the post a title so it can be saved
        await titleLocator.fill('Playwright test — block render');

        // Insert block via slash command
        await canvas3.click();
        await page.keyboard.press('Enter');
        await page.keyboard.type('/plusmagi');
        const suggestion = page.locator(
            `[role="option"]:has-text("${BLOCK_TITLE}"), button:has-text("${BLOCK_TITLE}")`
        ).first();
        await suggestion.click();

        // Confirm block wrapper appears (check in iframe if needed)
        const { frame: frame3 } = await getEditorContext(page);
        await (frame3 ?? page).locator('.plusmagi-site-search-editor-wrapper').waitFor({ state: 'visible' });

        // Save / publish the post (label varies by locale; use class instead)
        const publishBtn = page.locator('.editor-post-publish-button, .editor-post-publish-panel__toggle').first();
        await publishBtn.waitFor({ state: 'visible', timeout: 10_000 });
        await publishBtn.click();

        // Confirm in the publish panel if it opens (second click)
        const confirmBtn = page.locator(
            '.editor-post-publish-panel .editor-post-publish-button__button, ' +
            '.interface-interface-skeleton__sidebar .editor-post-publish-button__button'
        ).first();
        if (await confirmBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
            // Use dispatchEvent to handle element partially outside viewport
            await confirmBtn.dispatchEvent('click');
        }

        // After publishing the panel shows the post permalink in an input.
        // Read it and navigate directly — avoids locale-dependent "View Post" text.
        const permalinkInput = page.locator(
            '.editor-post-publish-panel input[type="text"], ' +
            '.editor-post-publish-panel__postpublish-permalink input'
        ).first();
        await permalinkInput.waitFor({ state: 'visible', timeout: 20_000 });
        const postUrl = await permalinkInput.inputValue();
        await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });

        // Frontend should render the search input from render_callback → render_shortcode()
        await expect(page.locator('.plusmagi-site-search-wrapper .plusmagi-site-search-input, #plusmagi-site-search-input').first()).toBeVisible({ timeout: 15_000 });
    });
});
