// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * PlusMagi Site Search — Gutenberg Block tests
 *
 * These tests use a WordPress application password through the REST API.
 * Run with the 'admin' Playwright project:
 *
 *   WP_APPLICATION_PASSWORD=yourpassword npx playwright test --project=admin block.spec.js
 *
 * Tests cover:
 *  1. Block type is registered in the REST API
 *  2. Block editor script metadata is registered
 *  3. Block markup can be saved in a post
 *  4. A published post renders the search widget on the frontend
 */

const BLOCK_NAME  = 'plusmagi-site-search/search';
const BLOCK_MARKUP = `<!-- wp:${BLOCK_NAME} /-->`;

function getAuthorizationHeaders() {
    const user = process.env.WP_ADMIN_USER || 'admin';
    const pass = process.env.WP_APPLICATION_PASSWORD;

    if (!pass) {
        throw new Error('WP_APPLICATION_PASSWORD environment variable is required for admin tests.');
    }

    return {
        Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`,
    };
}

// ===========================================================================
// REST API — block registration and persistence
// ===========================================================================
test.describe('Block registration — REST API', () => {
    test('block type is registered in /wp/v2/block-types', async ({ request }) => {
        const res = await request.get(`/wp-json/wp/v2/block-types/${BLOCK_NAME}`, {
            headers: getAuthorizationHeaders(),
        });
        expect(res.status()).toBe(200);

        const body = await res.json();
        expect(body.name).toBe(BLOCK_NAME);
        expect(typeof body.title).toBe('string');
    });

    test('block type has editorScript registered', async ({ request }) => {
        const res = await request.get(`/wp-json/wp/v2/block-types/${BLOCK_NAME}`, {
            headers: getAuthorizationHeaders(),
        });
        const body = await res.json();
        const hasScript =
            Array.isArray(body.editor_script_handles) &&
            body.editor_script_handles.length > 0;
        expect(hasScript, 'block should have an editorScript handle').toBe(true);
    });

    test('block markup can be saved in a post', async ({ request }) => {
        const headers = getAuthorizationHeaders();
        const createResponse = await request.post('/wp-json/wp/v2/posts', {
            headers,
            data: {
                title: 'Playwright REST block persistence test',
                content: BLOCK_MARKUP,
                status: 'draft',
            },
        });
        expect(createResponse.status(), await createResponse.text()).toBe(201);

        const post = await createResponse.json();
        try {
            expect(post.content.raw).toContain(BLOCK_MARKUP);
        } finally {
            const deleteResponse = await request.delete(`/wp-json/wp/v2/posts/${post.id}?force=true`, { headers });
            expect(deleteResponse.status(), await deleteResponse.text()).toBe(200);
        }
    });

    test('published block renders the search widget on the frontend', async ({ page, request }) => {
        const headers = getAuthorizationHeaders();
        const createResponse = await request.post('/wp-json/wp/v2/posts', {
            headers,
            data: {
                title: 'Playwright REST block render test',
                content: BLOCK_MARKUP,
                status: 'publish',
            },
        });
        expect(createResponse.status(), await createResponse.text()).toBe(201);

        const post = await createResponse.json();
        try {
            await page.goto(post.link, { waitUntil: 'domcontentloaded', timeout: 30_000 });
            await expect(page.locator('.plusmagi-site-search-wrapper .plusmagi-site-search-input, #plusmagi-site-search-input').first()).toBeVisible({ timeout: 15_000 });
        } finally {
            const deleteResponse = await request.delete(`/wp-json/wp/v2/posts/${post.id}?force=true`, { headers });
            expect(deleteResponse.status(), await deleteResponse.text()).toBe(200);
        }
    });
});
