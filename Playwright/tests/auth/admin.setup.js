// @ts-check
const { test: setup, expect } = require('@playwright/test');

/**
 * Validate the WordPress application password through the REST API.
 */
setup('authenticate with WordPress application password', async ({ request }) => {
    const user = process.env.WP_ADMIN_USER || 'admin';
    const pass = process.env.WP_APPLICATION_PASSWORD;

    if (!pass) {
        throw new Error(
            'WP_APPLICATION_PASSWORD environment variable is required for admin tests.\n' +
            'Set WP_APPLICATION_PASSWORD in .env or run: WP_APPLICATION_PASSWORD=yourpassword npx playwright test --project=setup'
        );
    }

    const authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
    const response = await request.get('/wp-json/wp/v2/users/me', {
        headers: { Authorization: authorization },
    });

    expect(response.status(), await response.text()).toBe(200);
});
