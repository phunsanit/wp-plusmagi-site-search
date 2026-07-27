# PlusMagi Site Search

A WordPress plugin that enables detailed and powerful search capabilities for your site.

## Features

- **Strict Access Control**:
  - **Public**: Only published posts.
  - **Author**: Own drafts/pending + all published.
  - **Admin/Editor**: Everything.
- **Advanced Filtering & Search Logic**:
  - **Custom Fields (Meta)**: Automatically searches all custom fields (e.g., SKUs, internal codes) linked to posts.
  - **Search Prefixes**:
    - `post: keyword` - Search specific pages/posts.
    - `tag: keyword` - Search specific tags.
    - `category: keyword` - Search specific categories.
    - `keyword` (no prefix) - Smart search across all types.
- **Rich Results**:
  - **Thumbnails**: Displays featured images in results if available.
  - **Tabs**: Results are automatically organized into Posts, Categories, and Tags tabs.
- **Admin-Like UI**: Matches the WordPress link inserter style with icons and metadata.
- **Theme Integration**: Automatically inherits theme colors via CSS variables.

## Live Demo

You can see a live demo of the plugin in action at [plusmagi-site-search.plusmagi.com](https://plusmagi-site-search.plusmagi.com/).

## Installation

1. Download the latest release from the `build/` directory or build it yourself.
2. Upload `plusmagi-site-search.zip` to your WordPress plugins page.
3. Activate the plugin.

## Build Instructions

To build the plugin zip file:

```bash
./build.sh
```

The output file will be located at `build/plusmagi-site-search.zip`.

## Testing

End-to-end tests run against the live site using [Playwright](https://playwright.dev/).
Tests are located in `Playwright/tests/search.spec.js` (51 tests across 3 browsers).

### Setup (first time only)

```bash
cd Playwright
npm install
npx playwright install chromium firefox webkit
```

### Daily use

```bash
# Run all tests — Chromium, Firefox, Safari in parallel
npm test
```

### Debug a specific browser

```bash
npm run test:chromium   # Chrome / Edge
npm run test:firefox    # Firefox
npm run test:safari     # Safari (WebKit)
```

### When a test fails

```bash
# 1. Open the HTML report to see screenshots and error details
npm run report

# 2. If still unclear, step through tests visually
npm run test:ui
```

### Test coverage

| Area | What is tested |
|------|---------------|
| Widget | Input visible, scripts enqueued, `plusmagiSiteSearch` object defined |
| Debounce | No API request for queries shorter than 2 characters |
| Search | Dropdown appears, tabs render, tab switching, click-outside closes |
| Prefixes | `post:`, `tag:`, `category:` all trigger correct REST requests |
| REST API | Status codes, response shape, access control (public sees only published) |


## Usage

Use the shortcode anywhere on your site:

```
[plusmagi-site-search]
```

## Security & User Roles

**Is the search appropriate for User Roles?**

Yes, it is appropriate and secure. Logic has been implemented to strictly check user capabilities in `pm-search.php` (function `handle_search`) as follows:

- **Guest**: Can only search for posts with **Publish** status.
- **Author**: Can search for their own posts that are **Draft**, **Pending**, or **Private** (using the `filter_author_posts_where` filter to restrict results to their own posts).
- **Editor / Admin**: Can search for posts of **all statuses**, whether Publish, Draft, Private, Pending, or Future, from any user.

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
