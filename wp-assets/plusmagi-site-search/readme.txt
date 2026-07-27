=== PlusMagi Site Search ===
Contributors: phunsanit
Tags: search, frontend, admin-search, post-search, role-based
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 7.2
Stable tag: 1.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
License (secondary): MIT
License URI (secondary): https://opensource.org/licenses/MIT
Text Domain: plusmagi-site-search

Enhance your WordPress search with Ajax-powered live results, deep custom field indexing, and smart role-based access control.

== Description ==

PlusMagi Site Search is a comprehensive search solution designed to replace the limited default WordPress search. It provides a fast, modern, and highly relevant search experience by indexing content that WordPress usually ignores, such as Custom Fields and Meta Data.

Whether you are running a simple blog or a complex membership site, Smart Access Control ensures that search results are filtered based on the user's role. Editors see everything, while guests only see what is public.

== Features ==

*   **Ajax Live Search**: Instant search results with zero page refreshes.
*   **Smart Access Control**: Filters results for Public, Authors, and Admins dynamically.
*   **Deep Search Capability**:
	*   Post Titles and Content.
	*   Custom Fields (meta data like SKUs and internal codes).
	*   Taxonomies (Categories and Tags).
*   **Organized Search Results**: Results are grouped into Posts, Category, and Tag tabs.
*   **Visual Enhancements**: Shows featured images (thumbnails) in the search dropdown.
*   **Advanced Search Filters**: Use prefixes like `post:`, `tag:`, or `category:`.
*   **Developer Friendly**: Supports shortcode `[plusmagi-site-search]` and Block Editor.
*   **High Performance**: Optimized with lightweight Ajax calls.
*   **WordPress 7.0 Ready**: Fully tested and optimized for WordPress 7.0 and PHP 7.4+.

For more information, visit [https://plusmagi-site-search.plusmagi.com](https://plusmagi-site-search.plusmagi.com).

== Installation ==

1.  Upload the `plusmagi-site-search` directory to `/wp-content/plugins/`.
2.  Activate the plugin in the Plugins menu.
3.  Add `[plusmagi-site-search]` to any page or post.
4.  Optional (theme template): `<?php echo do_shortcode('[plusmagi-site-search]'); ?>`

== Frequently Asked Questions ==

= Does it support Private Posts? =

Yes, but only for users with the appropriate permissions (like Admins or Editors).

= Can it search WooCommerce SKUs? =

Yes. By enabling Custom Field search, it can index and find products by their SKU.

= Does it slow down my site? =

No, the plugin is optimized with lightweight Ajax calls to ensure high performance.

== Screenshots ==

1. Live search dropdown with categorized tabs (Posts, Category, Tag).
2. Role-based visibility with secure result filtering.
3. Frontend integration via shortcode and theme template.

== Changelog ==

= 1.0.1 =
*   Added WordPress 7.0 full compatibility and verified support.
*   Fixed frontend Ajax search bug where the Nonce security token was named incorrectly.
*   Fixed frontend search result tab switcher where clicking tabs failed to show the active state.
*   Updated plugin documentation and metadata tags.

= 1.0.2 =
*   Initial release.
