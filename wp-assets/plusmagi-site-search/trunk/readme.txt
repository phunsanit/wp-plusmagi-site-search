=== PlusMagi Site Search ===
Contributors: phunsanit
Tags: site search, ajax search, live search, custom fields search, woocommerce sku
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 7.2
Stable tag: 1.0.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
License (secondary): MIT
License URI (secondary): https://opensource.org/licenses/MIT
Text Domain: plusmagi-site-search

Replace the default WordPress search with fast Ajax live search, deeper custom fields indexing, and more relevant internal search results.

== Description ==

Is the default WordPress search missing important content or slowing users down?

PlusMagi Site Search is a lightweight, high-performance search replacement built to improve internal search accuracy with Ajax live search, cleaner result presentation, and deeper indexing across posts, pages, categories, tags, and custom fields.

It is especially useful for content-heavy websites, internal knowledge bases, membership sites, and WooCommerce stores that need visitors to find the right content quickly. Role-based filtering helps keep restricted results visible only to the right users, while public visitors get a fast and secure search experience.

If you need a custom search plugin that goes beyond native WordPress search, PlusMagi Site Search helps surface hidden content, supports WooCommerce SKU-style metadata search, and keeps the search experience fast and easy to scan.

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

1.  Go to `Plugins > Add New` in WordPress, or download the plugin from `https://wordpress.org/plugins/plusmagi-site-search`.
2.  Search for `PlusMagi Site Search`.
3.  Click `Install Now`, then `Activate`.
4.  Add the `PlusMagi Site Search` block or `[plusmagi-site-search]` shortcode to any page or post.

== Frequently Asked Questions ==

= Does it support Private Posts and Drafts? =

Yes. PlusMagi Site Search includes role-based filtering. Logged-in users with the right capabilities, such as Editors or Admins, can search private posts or drafts. Public visitors will only see content they are allowed to access.

= Can it search WooCommerce SKUs? =

Yes. By searching custom fields and meta data, the plugin can surface WooCommerce products by SKU and other metadata that default WordPress search often misses.

= Does it slow down my website or server database? =

No. The plugin is designed to stay lightweight and uses optimized Ajax requests for live results without adding unnecessary analytics overhead.

= How can I customize the look to match my theme? =

You can style the search interface with your theme or child theme CSS. The plugin output uses standard markup and classes, so it is straightforward to adapt the dropdown and result layout to your site design.

== Screenshots ==

1. Search widget embedded in a live site sidebar using the PlusMagi Site Search block.
2. Ajax live search dropdown showing grouped results for Posts, Category, and Tag.
3. Full live-site layout with the search widget integrated into a real sidebar.

== Changelog ==

= 1.0.2 =
*   Added WordPress 7.0 full compatibility and verified support.
*   Fixed frontend Ajax search bug where the Nonce security token was named incorrectly.
*   Fixed frontend search result tab switcher where clicking tabs failed to show the active state.
*   Updated plugin documentation and metadata tags.

= 1.0.2 =
*   Initial release.
