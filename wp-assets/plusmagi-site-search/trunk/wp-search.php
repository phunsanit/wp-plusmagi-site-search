<?php
/**
 * Plugin Name: PlusMagi Site Search
 * Plugin URI:  https://plusmagi-site-search.plusmagi.com
 * Description: A frontend search plugin that mimics the WordPress admin search functionality, with role-based access control.
 * Version:    1.0.2
 * Author:     Pitt Phunsanit <phunsanit@gmail.com>, <phunsanit@plusmagi.com>
 * Author URI: https://pitt.plusmagi.com
 * License:    MIT
 * License URI: https://opensource.org/licenses/MIT
 * Text Domain: plusmagi-site-search
 */

if (!defined('ABSPATH')) {
	exit;
}

define('PLUSMAGI_SITE_SEARCH_VERSION', '1.0.2');
define('PLUSMAGI_SITE_SEARCH_FILE', __FILE__);
define('PLUSMAGI_SITE_SEARCH_URL', plugin_dir_url(__FILE__));
define('PLUSMAGI_SITE_SEARCH_PATH', plugin_dir_path(__FILE__));

class Plusmagi_Site_Search
{

	private static $instance = null;

	/**
	 * Holds the current REST search term while custom-field filters are active.
	 * Null when filters are not registered, which prevents them from firing
	 * on unrelated WP_Query calls elsewhere on the page.
	 *
	 * @var string|null
	 */
	private $search_term = null;

	public static function get_instance()
	{
		if (self::$instance === null) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function __construct()
	{
		add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
		add_shortcode('plusmagi_search', [$this, 'render_shortcode']);
		add_action('rest_api_init', [$this, 'register_rest_routes']);
		add_action('init', [$this, 'register_blocks']);

		// Admin Menu
		add_action('admin_menu', [$this, 'add_admin_menu']);
	}

	   public function register_blocks()
	   {
		   wp_register_script(
			   'plusmagi-site-search-block-js',
			   PLUSMAGI_SITE_SEARCH_URL . 'assets/js/block.js',
			   ['wp-blocks', 'wp-element'],
			   PLUSMAGI_SITE_SEARCH_VERSION,
			   true
		   );

		   register_block_type('plusmagi-site-search/search', [
			   'editor_script'   => 'plusmagi-site-search-block-js',
			   'render_callback' => [$this, 'render_shortcode']
		   ]);
	   }

	   public function add_admin_menu()
	   {
		   add_menu_page(
			   'PlusMagi Site Search',
			   'PlusMagi Site Search',
			   'manage_options',
			   'plusmagi-site-search',
			   [$this, 'render_admin_page'],
			   'dashicons-search',
			   100
		   );
	   }

	   public function render_admin_page()
	   {
		   ?>
		   <div class="wrap">
			   <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
			   <p><?php esc_html_e('Thank you for using PlusMagi Site Search! This plugin provides a frontend search experience similar to the WordPress admin search, with role-based access control.', 'plusmagi-site-search'); ?></p>

			   <div class="card">
				   <h2><?php esc_html_e('About the Developer', 'plusmagi-site-search'); ?></h2>
				   <p>
					   <?php esc_html_e('For support, updates, and more information, please visit our website:', 'plusmagi-site-search'); ?>
					   <br>
					   <a href="https://plusmagi-site-search.plusmagi.com" target="_blank" rel="noopener noreferrer">
						   <strong><?php esc_html_e('Visit plusmagi-site-search.plusmagi.com →', 'plusmagi-site-search'); ?></strong>
					   </a>
				   </p>
			   </div>
		   </div>
		   <?php
	   }

	/**
	 * Enqueue frontend scripts and styles on all public pages.
	 *
	 * The search widget can be placed in sidebars, widget areas, or theme
	 * templates where $post->post_content is never involved, so checking
	 * has_shortcode() / has_block() is not a reliable gate. Loading two
	 * small files on every frontend page is the correct approach for any
	 * plugin whose output location cannot be predicted at enqueue time.
	 */
	   public function enqueue_scripts()
	   {
		   wp_enqueue_script(
			   'plusmagi-site-search-js',
			   PLUSMAGI_SITE_SEARCH_URL . 'assets/js/search.js',
			   ['jquery'],
			   PLUSMAGI_SITE_SEARCH_VERSION,
			   true
		   );

		   wp_enqueue_style(
			   'plusmagi-site-search-css',
			   PLUSMAGI_SITE_SEARCH_URL . 'assets/css/search.css',
			   ['dashicons'],
			   PLUSMAGI_SITE_SEARCH_VERSION
		   );

		   wp_localize_script('plusmagi-site-search-js', 'plusmagiSiteSearch', [
			   'root'  => esc_url_raw(rest_url()),
			   'nonce' => wp_create_nonce('wp_rest'),
		   ]);
	   }

	   public function render_shortcode()
	   {
		   ob_start();
		   ?>
		   <div id="plusmagi-site-search-wrapper">
			   <input type="text" id="plusmagi-site-search-input" placeholder="<?php esc_attr_e('Search...', 'plusmagi-site-search'); ?>" autocomplete="off">
			   <div id="plusmagi-site-search-results"></div>
		   </div>
		   <?php
		   return ob_get_clean();
	   }

	   public function register_rest_routes()
	   {
		   register_rest_route('plusmagi-site-search/v1', '/search', [
			   'methods'  => 'GET',
			   'callback' => [$this, 'handle_search'],
			   /**
				* This is an intentionally public search endpoint, equivalent to
				* WordPress core's own search. Unauthenticated requests receive only
				* published content. Role-based access control (exposing drafts /
				* private posts to editors and authors) is enforced inside
				* handle_search() via is_user_logged_in() and current_user_can(),
				* which is the correct pattern for endpoints that serve different
				* data depending on the caller's authentication state.
				*
				* @see https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/#permissions-callback
				*/
			   'permission_callback' => '__return_true',
			   'args'   => [
				   'term' => [
					   'required'        => true,
					   'type'            => 'string',
					   'sanitize_callback' => 'sanitize_text_field',
					   'validate_callback' => function ($value) {
						   return is_string($value) && strlen(trim($value)) >= 2;
					   },
				   ],
			   ],
		   ]);
	   }

	/**
	 * Decode HTML entities in result text so frontend shows readable characters.
	 */
	private function decode_result_text($text)
	{
		$decoded = html_entity_decode((string) $text, ENT_QUOTES, 'UTF-8');
		return wp_strip_all_tags($decoded);
	}

	public function handle_search($request)
	{
		$raw_term = sanitize_text_field($request['term']);

		if (empty($raw_term)) {
			return rest_ensure_response([]);
		}

		$results	 = [];
		$search_mode = 'all'; // Default: search everything
		$search_term = $raw_term;

		// Check for prefixes
		if (strpos($raw_term, 'post:') === 0) {
			$search_mode = 'post';
			$search_term = trim(substr($raw_term, 5));
		} elseif (strpos($raw_term, 'tag:') === 0) {
			$search_mode = 'tag';
			$search_term = trim(substr($raw_term, 4));
		} elseif (strpos($raw_term, 'category:') === 0) {
			$search_mode = 'category';
			$search_term = trim(substr($raw_term, 9));
		}

		if (empty($search_term)) {
			return rest_ensure_response([]);
		}

		// 1. Search Terms (Categories, Tags)
		if ($search_mode === 'all' || $search_mode === 'tag' || $search_mode === 'category') {
			$taxonomies = [];
			if ($search_mode === 'all') {
				$taxonomies = ['category', 'post_tag'];
			} elseif ($search_mode === 'tag') {
				$taxonomies = ['post_tag'];
			} elseif ($search_mode === 'category') {
				$taxonomies = ['category'];
			}

			if (!empty($taxonomies)) {
				$terms = get_terms([
					'taxonomy'   => $taxonomies,
					'search'	 => $search_term,
					'hide_empty' => false,
					'number'	 => 10,
				]);

				if (!empty($terms) && !is_wp_error($terms)) {
					foreach ($terms as $term) {
						$results[] = [
							'id'			=> $term->term_id,
							'title'		 => $this->decode_result_text($term->name),
							'link'		  => get_term_link($term),
							'status'		=> ucfirst($term->taxonomy === 'post_tag' ? 'Tag' : 'Category'),
							'type'		  => 'term',
							'original_type' => $term->taxonomy,
							'date'		  => '',
						];
					}
				}
			}
		}

		// 2. Search Posts
		if ($search_mode === 'all' || $search_mode === 'post') {
			$args = [
				'post_type'	  => ['post', 'page'],
				'posts_per_page' => 20,
				's'			  => $search_term,
				'post_status'	=> 'publish',
			];

			// Advanced Access Control Logic
			if (is_user_logged_in()) {
				if (current_user_can('edit_others_posts')) {
					// Editors / Admins: see all statuses.
					$args['post_status'] = ['publish', 'draft', 'pending', 'private', 'future'];
				} elseif (current_user_can('edit_posts')) {
					// Authors: see published content + their own non-published posts.
					$args['post_status'] = ['publish', 'draft', 'pending', 'private'];
					add_filter('posts_where', [$this, 'filter_author_posts_where'], 10, 2);
				}
			}

			// Enable Custom Fields Search join/where.
			// $this->search_term acts as the gate: the filter callbacks skip
			// themselves when it is null, ensuring they never affect unrelated
			// WP_Query calls elsewhere on the page.
			// NOTE: is_search() returns false inside a REST request, so we
			// cannot use it here as a guard.
			$this->search_term = $search_term;
			add_filter('posts_join', [$this, 'search_join_custom_fields']);
			add_filter('posts_where', [$this, 'search_where_custom_fields']);
			add_filter('posts_distinct', [$this, 'search_distinct']);

			$query = new WP_Query($args);

			// Cleanup filters immediately after the query.
			$this->search_term = null;
			remove_filter('posts_join', [$this, 'search_join_custom_fields']);
			remove_filter('posts_where', [$this, 'search_where_custom_fields']);
			remove_filter('posts_distinct', [$this, 'search_distinct']);

			if (is_user_logged_in() && !current_user_can('edit_others_posts') && current_user_can('edit_posts')) {
				remove_filter('posts_where', [$this, 'filter_author_posts_where'], 10);
			}

			if ($query->have_posts()) {
				while ($query->have_posts()) {
					$query->the_post();
					$post_id	 = get_the_ID();
					$post_status = get_post_status();

					// Secondary guard: never leak non-published posts to users who
					// are not the author or an editor.
					if (
						$post_status !== 'publish' &&
						(int) get_post_field('post_author', $post_id) !== get_current_user_id() &&
						!current_user_can('edit_others_posts')
					) {
						continue;
					}

					$thumb_url = get_the_post_thumbnail_url($post_id, 'thumbnail');

					$results[] = [
						'id'			 => $post_id,
						'title'		  => $this->decode_result_text(get_the_title($post_id)),
						'link'		   => get_permalink(),
						'status'		 => $post_status,
						'type'		   => 'post',
						'original_type'  => get_post_type(),
						'post_type_label' => get_post_type_object(get_post_type())->labels->singular_name,
						'date'		   => get_the_date(),
						'thumbnail'	  => $thumb_url ? $thumb_url : null,
					];
				}
				wp_reset_postdata();
			}
		}

		return rest_ensure_response($results);
	}

	public function search_join_custom_fields($join)
	{
		global $wpdb;
		// $this->search_term is only non-null while our REST query is running.
		// is_search() returns false inside a REST request, so we use this
		// property as the guard instead.
		if (!empty($this->search_term)) {
			$join .= " LEFT JOIN {$wpdb->postmeta} ON ({$wpdb->posts}.ID = {$wpdb->postmeta}.post_id) ";
		}
		return $join;
	}

	public function search_where_custom_fields($where)
	{
		global $wpdb;
		// $this->search_term is set by handle_search() before filters are added
		// and cleared immediately after the query runs. We use it here instead of
		// get_query_var('s') because query vars are not populated in REST context.
		if (!empty($this->search_term)) {
			// Extend WP_Query's standard search clause to also match post meta.
			// Standard clause: AND (((post_title LIKE '%x%') OR (post_excerpt LIKE '%x%') OR (post_content LIKE '%x%')))
			// We append an OR branch for meta_value before the trailing parentheses.
			$like	 = '%' . $wpdb->esc_like($this->search_term) . '%';
			$meta_sql = $wpdb->prepare(" OR ({$wpdb->postmeta}.meta_value LIKE %s) ", $like);

			$where = preg_replace('/\)\)\s*$/', ") $meta_sql )", $where);
		}
		return $where;
	}

	public function search_distinct($distinct)
	{
		// Only applies while $this->search_term is set (guarded by the caller).
		return 'DISTINCT';
	}

	public function filter_author_posts_where($where, $query)
	{
		global $wpdb;
		$current_user_id = (int) get_current_user_id();

		// Use $wpdb->prepare() so the user ID is safely interpolated even
		// though it is already cast to int above.
		$where .= $wpdb->prepare(
			" AND ( {$wpdb->posts}.post_status = 'publish' OR {$wpdb->posts}.post_author = %d ) ",
			$current_user_id
		);

		return $where;
	}
}

/**
 * Begins execution of the plugin.
 */
function plusmagi_site_search_load_plugin() {
	Plusmagi_Site_Search::get_instance();
}
add_action('plugins_loaded', 'plusmagi_site_search_load_plugin');
