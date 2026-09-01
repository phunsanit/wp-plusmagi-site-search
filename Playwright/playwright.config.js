// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Playwright configuration for PlusMagi Site Search plugin tests.
 * Target: WP_URL from the repository .env file.
 *
 * Run all guest tests:       npx playwright test
 * Run with UI:               npx playwright test --ui
 * Run admin/block tests:     npx playwright test --project=admin  (uses .env)
 * Show HTML report:          npx playwright show-report
 */

const wpUrl = process.env.WP_URL;

if (!wpUrl) {
    throw new Error('WP_URL environment variable is required. Set WP_URL in the repository .env file.');
}

const baseURL = /^https?:\/\//i.test(wpUrl) ? wpUrl : `https://${wpUrl}`;

module.exports = defineConfig({
    testDir: './tests',
    timeout: 60_000,

    /* Retry once on CI, never locally */
    retries: process.env.CI ? 1 : 0,

    /* Run tests in parallel by default */
    fullyParallel: true,

    /* Reporter */
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
    ],

    /* Shared settings for every test */
    use: {
        baseURL,

        /* Allow up to 60s for any navigation on this ad-heavy live site */
        navigationTimeout: 60_000,
        actionTimeout: 15_000,

        /* Capture screenshot only on failure */
        screenshot: 'only-on-failure',

        /* Record a video only when retrying a failed test */
        video: 'on-first-retry',

        /* Keep traces on failures for debugging */
        trace: 'on-first-retry',
    },

    projects: [
        // ------------------------------------------------------------------
        // Setup: validate REST API authentication with an application password
        // Run: npx playwright test --project=setup  (uses .env)
        // ------------------------------------------------------------------
        {
            name: 'setup',
            testMatch: /auth\/admin\.setup\.js/,
            use: { ...devices['Desktop Chrome'] },
        },

        // ------------------------------------------------------------------
        // Guest tests — no authentication required (3 browsers)
        // ------------------------------------------------------------------
        {
            name: 'chromium',
            testIgnore: /block\.spec\.js/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            testIgnore: /block\.spec\.js/,
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            testIgnore: /block\.spec\.js/,
            use: { ...devices['Desktop Safari'] },
        },

        // ------------------------------------------------------------------
        // Authenticated block tests — REST API plus public frontend rendering
        // ------------------------------------------------------------------
        {
            name: 'admin',
            testMatch: /block\.spec\.js/,
            dependencies: ['setup'],
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
