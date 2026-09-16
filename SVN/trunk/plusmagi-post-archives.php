<?php
/**
 * Plugin Name: PlusMagi Post Archives
 * Plugin URI:  https://plusmagi-post-archives.plusmagi.com
 * Description: A frontend post archives plugin that organizes WordPress content with search capabilities and role-based access control.
 * Version:    1.0.0
 * Author:     Pitt Phunsanit <phunsanit@gmail.com>, <phunsanit@plusmagi.com>
 * Author URI: https://pitt.plusmagi.com
 * License:    GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: plusmagi-post-archives
 */

if (!defined('ABSPATH')) {
	exit;
}

define('PLUSMAGI_POST_ARCHIVES_VERSION', '1.0.0');
define('PLUSMAGI_POST_ARCHIVES_FILE', __FILE__);
define('PLUSMAGI_POST_ARCHIVES_URL', plugin_dir_url(__FILE__));
define('PLUSMAGI_POST_ARCHIVES_PATH', plugin_dir_path(__FILE__));

class Plusmagi_Post_Archives
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

	/**
	 * Default meta keys included in meta_value search.
	 * Can be customized via the plusmagi_post_archives_meta_keys filter.
	 *
	 * @var string[]
	 */
	private $default_searchable_meta_keys = ['_sku', 'custom_summary'];

	public static function get_instance()
	{
		if (self::$instance === null) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function __construct()
	{
		add_shortcode('plusmagi-post-archives', [$this, 'render_shortcode']);
		add_action('init', [$this, 'register_blocks']);
		add_action('admin_menu', [$this, 'add_admin_menu']);
	}

	public function register_blocks()
	{
		wp_register_style(
			'plusmagi-post-archives-archives',
			PLUSMAGI_POST_ARCHIVES_URL . 'assets/css/style.css',
			[],
			PLUSMAGI_POST_ARCHIVES_VERSION
		);

		wp_register_script(
			'plusmagi-post-archives-block-js',
			PLUSMAGI_POST_ARCHIVES_URL . 'assets/js/block.js',
			['wp-blocks', 'wp-element'],
			PLUSMAGI_POST_ARCHIVES_VERSION,
			true
		);

		register_block_type('plusmagi-post-archives/search', [
			'editor_script'   => 'plusmagi-post-archives-block-js',
			'style'           => 'plusmagi-post-archives-archives',
			'render_callback' => [$this, 'render_shortcode']
		]);
	}

	public function add_admin_menu()
	{
		add_menu_page(
			'PlusMagi Post Archives',
			'PlusMagi Post Archives',
			'manage_options',
			'plusmagi-post-archives',
			[$this, 'render_admin_page'],
			'dashicons-search',
			100
		);
	}

	private function get_admin_preview_image_url()
	{
		$local_rel_path = 'assets/admin-preview.png';
		$local_abs_path = PLUSMAGI_POST_ARCHIVES_PATH . $local_rel_path;

		if (file_exists($local_abs_path)) {
			return PLUSMAGI_POST_ARCHIVES_URL . $local_rel_path;
		}

		return '';
	}

	public function render_admin_page()
	{
		$preview_image_url = $this->get_admin_preview_image_url();
		?>
		<div class="wrap">
			<h1><?php echo esc_html(get_admin_page_title()); ?></h1>
			<p><?php esc_html_e('Thank you for using PlusMagi Post Archives! This plugin provides a frontend archive experience with search capabilities similar to the WordPress admin, plus role-based access control.', 'plusmagi-post-archives'); ?></p>

			<div class="card">
				<h2><?php esc_html_e('Archives Preview', 'plusmagi-post-archives'); ?></h2>
				<p><?php esc_html_e('Live archives dropdown example from PlusMagi Post Archives.', 'plusmagi-post-archives'); ?></p>
				<?php if ($preview_image_url) : ?>
					<img src="<?php echo esc_url($preview_image_url); ?>" alt="<?php esc_attr_e('PlusMagi Post Archives preview', 'plusmagi-post-archives'); ?>" style="max-width:100%;height:auto;border:1px solid #dcdcde;border-radius:6px;display:block;">
				<?php endif; ?>
			</div>

			<div class="card">
				<h2><?php esc_html_e('About the Developer', 'plusmagi-post-archives'); ?></h2>
				<p>
					<?php esc_html_e('For support, updates, and more information, please visit our website:', 'plusmagi-post-archives'); ?>
					<br>
					<a href="https://plusmagi-post-archives.plusmagi.com" target="_blank" rel="noopener noreferrer">
						<strong><?php esc_html_e('Visit plusmagi-post-archives.plusmagi.com →', 'plusmagi-post-archives'); ?></strong>
					</a>
				</p>
			</div>
		</div>
		<?php
	}

	public function render_shortcode()
	{
		global $wpdb;

		$cache_key = 'plusmagi_post_archives_months';
		$archives = wp_cache_get($cache_key, 'plusmagi-post-archives');

		if (false === $archives) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Monthly archive aggregation is cached below and mirrors WordPress archives data.
			$archives = $wpdb->get_results(
				"SELECT YEAR(post_date) AS year, MONTH(post_date) AS month, COUNT(ID) AS post_count
				FROM {$wpdb->posts}
				WHERE post_type = 'post'
					AND post_status = 'publish'
					AND post_date > '0000-00-00 00:00:00'
				GROUP BY YEAR(post_date), MONTH(post_date)
				ORDER BY year DESC, month DESC"
			);
			wp_cache_set($cache_key, $archives, 'plusmagi-post-archives', 3600);
		}

		if (empty($archives)) {
			return '';
		}

		ob_start();
		$select_attributes = '';
		if (!function_exists('amp_is_request') || !amp_is_request()) {
			$select_attributes = ' onchange="if (this.value) window.location.href = this.value;"';
		}
		?>
		<div class="wp-block-archives field-group">
			<label for="wp-block-archives-1" class="wp-block-archives__label">
				<?php esc_html_e('Archives', 'plusmagi-post-archives'); ?>
			</label>

			<div class="select-wrapper">
				<select id="wpblockarchives1" name="archive-dropdown" class="form-select"<?php echo $select_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
					<option value="" disabled selected><?php esc_html_e('Select Month', 'plusmagi-post-archives'); ?></option>
					<?php $current_year = null; ?>
					<?php foreach ($archives as $archive) : ?>
						<?php if ((int) $archive->year !== $current_year) : ?>
							<?php if ($current_year !== null) : ?></optgroup><?php endif; ?>
							<optgroup label="<?php echo esc_attr($archive->year); ?>">
							<?php $current_year = (int) $archive->year; ?>
						<?php endif; ?>
						<option value="<?php echo esc_url(get_month_link($archive->year, $archive->month)); ?>">
							<?php echo esc_html(wp_date('F', mktime(0, 0, 0, $archive->month, 1, $archive->year))); ?>
							(<?php echo esc_html($archive->post_count); ?>)
						</option>
					<?php endforeach; ?>
					<?php if ($current_year !== null) : ?></optgroup><?php endif; ?>
				</select>

				<span class="select-arrow" aria-hidden="true">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M6 9l6 6 6-6" />
					</svg>
				</span>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Return sanitized, unique meta keys allowed in meta search.
	 *
	 * @return string[]
	 */
	private function get_searchable_meta_keys()
	{
		$meta_keys = apply_filters('plusmagi_post_archives_meta_keys', $this->default_searchable_meta_keys);

		if (!is_array($meta_keys)) {
			return $this->default_searchable_meta_keys;
		}

		$meta_keys = array_map('sanitize_key', $meta_keys);
		$meta_keys = array_filter($meta_keys, static function ($meta_key) {
			return $meta_key !== '';
		});

		return array_values(array_unique($meta_keys));
	}

	/**
	 * Build a SQL snippet to constrain search to whitelisted meta keys.
	 *
	 * @return string
	 */
	private function build_meta_key_sql_condition()
	{
		global $wpdb;

		$meta_keys = $this->get_searchable_meta_keys();
		if (empty($meta_keys)) {
			return '';
		}

		$placeholders = implode(', ', array_fill(0, count($meta_keys), '%s'));
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- Placeholder count is generated from sanitized whitelist keys, values are still passed to prepare().
		$prepared_values = $wpdb->prepare($placeholders, ...$meta_keys);

		return " AND ({$wpdb->postmeta}.meta_key IN ({$prepared_values}))";
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
			$meta_key_condition = $this->build_meta_key_sql_condition();
			$join .= " LEFT JOIN {$wpdb->postmeta} ON ({$wpdb->posts}.ID = {$wpdb->postmeta}.post_id{$meta_key_condition}) ";
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
			$meta_key_condition = $this->build_meta_key_sql_condition();
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Meta key SQL is a prepared fragment generated from sanitized whitelist keys.
			$meta_sql = $wpdb->prepare(" OR (({$wpdb->postmeta}.meta_value LIKE %s){$meta_key_condition}) ", $like);

			$replacements = 0;
			$updated_where = preg_replace('/\)\)\s*$/', ") $meta_sql )", $where, 1, $replacements);

			if ($replacements === 1 && is_string($updated_where)) {
				$where = $updated_where;
			}
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
function plusmagi_post_archives_load_plugin() {
	Plusmagi_Post_Archives::get_instance();
}
add_action('plugins_loaded', 'plusmagi_post_archives_load_plugin');
