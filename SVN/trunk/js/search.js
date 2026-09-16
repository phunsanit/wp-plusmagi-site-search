jQuery(document).ready(function ($) {
	var minChars = parseInt(plusmagiPostArchives.minChars, 10) || 3;
	var searchTabs = [
		{ key: 'posts', label: 'Posts', mode: 'post' },
		{ key: 'categories', label: 'Category', mode: 'term' },
		{ key: 'tags', label: 'Tag', mode: 'term' }
	];

	$('.plusmagi-post-archives-wrapper').each(function (index) {
		var $wrapper = $(this);
		var $input = $wrapper.find('.plusmagi-post-archives-input').first();
		var $results = $wrapper.find('.plusmagi-post-archives-results').first();
		var timer;
		var activeTab = 'posts';

		if (!$input.length || !$results.length) {
			return;
		}

		var widgetId = $wrapper.attr('data-plusmagi-search-id');
		if (!widgetId) {
			widgetId = 'plusmagi-search-' + index + '-' + Date.now();
			$wrapper.attr('data-plusmagi-search-id', widgetId);
		}
		$results.attr('data-plusmagi-search-owner', widgetId);

		if ($results.length > 0 && !$results.parent().is('body')) {
			$('body').append($results);
		}

		function repositionDropdown() {
			if (!$input.is(':visible')) {
				return;
			}

			var rect = $input[0].getBoundingClientRect();
			var width = rect.width;
			var left = rect.left;
			var viewportWidth = $(window).width();

			if (left + width > viewportWidth - 8) {
				left = Math.max(8, viewportWidth - width - 8);
			}

			$results.css({
				'top': (rect.bottom + 4) + 'px',
				'left': left + 'px',
				'width': width + 'px',
				'position': 'fixed',
				'z-index': 999999
			});
		}

		$(window).on('resize scroll', function () {
			if ($results.is(':visible')) {
				repositionDropdown();
			}
		});

		function buildItem(item, mode) {
			var $li = $('<li>');
			var $a = $('<a>').attr('href', item.link);
			var $icon = $('<div>').addClass('plusmagi-post-archives-item-icon');

			if (item.thumbnail) {
				$('<img>')
					.addClass('plusmagi-post-archives-item-thumb')
					.attr('src', item.thumbnail)
					.attr('alt', '')
					.appendTo($icon);
			} else {
				var iconClass = 'dashicons-admin-post';
				if (mode === 'term') {
					iconClass = (item.original_type === 'category') ? 'dashicons-category' : 'dashicons-tag';
				} else if (item.original_type === 'page') {
					iconClass = 'dashicons-admin-page';
				}

				$('<span>')
					.addClass('dashicons ' + iconClass)
					.css({ 'font-size': '20px', 'width': '20px', 'height': '20px', 'line-height': '20px' })
					.appendTo($icon);
			}

			var $details = $('<div>').addClass('plusmagi-post-archives-item-details');
			var $title = $('<span>').addClass('plusmagi-post-archives-item-title').text(item.title);

			if (mode !== 'term' && item.status && item.status !== 'publish') {
				$('<span>').addClass('plusmagi-post-archives-status-pill').text(item.status).appendTo($title);
			}

			$details.append($title);

			if (mode === 'post') {
				$('<span>').addClass('plusmagi-post-archives-item-info').text(item.date).appendTo($details);
			}

			$a.append($icon).append($details);
			$li.append($a);

			return $li;
		}

		function renderList(items, mode) {
			if (items.length === 0) {
				return $('<div>').addClass('plusmagi-post-archives-no-results').text('No results found.');
			}

			var $ul = $('<ul>');
			$.each(items, function (i, item) {
				$ul.append(buildItem(item, mode));
			});

			return $ul;
		}

		function renderTabs(buckets) {
			$results.empty();

			var $tabs = $('<div>').addClass('plusmagi-post-archives-tabs');

			$.each(searchTabs, function (_, tab) {
				$('<div>')
					.addClass('plusmagi-post-archives-tab')
					.attr('data-tab', tab.key)
					.text(tab.label + ' (' + buckets[tab.key].length + ')')
					.appendTo($tabs);
			});

			$results.append($tabs);
			$.each(searchTabs, function (_, tab) {
				$results.append(
					$('<div>')
						.addClass('plusmagi-post-archives-tab-content')
						.attr('data-tab-content', tab.key)
						.hide()
						.append(renderList(buckets[tab.key], tab.mode))
				);
			});

			$results.show();
			switchTab(activeTab);
		}

		function switchTab(tabName) {
			activeTab = tabName;
			$results.find('.plusmagi-post-archives-tab').removeClass('active');
			$results.find('.plusmagi-post-archives-tab[data-tab="' + tabName + '"]').addClass('active');

			$results.find('.plusmagi-post-archives-tab-content').hide();
			$results.find('.plusmagi-post-archives-tab-content[data-tab-content="' + tabName + '"]').show();
			repositionDropdown();
		}

		$results.on('mousedown', '.plusmagi-post-archives-tab', function (e) {
			e.preventDefault();
			switchTab($(this).data('tab'));
		});

		$input.on('focus', function () {
			if ($(this).val().trim().length >= minChars && $results.children().length > 0) {
				$results.show();
				repositionDropdown();
			}
		});

		$input.on('input', function () {
			var term = $(this).val().trim();
			clearTimeout(timer);

			if (term.length < minChars) {
				$results.hide().empty();
				return;
			}

			repositionDropdown();

			timer = setTimeout(function () {
				$.ajax({
					url: plusmagiPostArchives.root + 'plusmagi-post-archives/v1/search',
					method: 'GET',
					data: { term: term },
					beforeSend: function (xhr) {
						xhr.setRequestHeader('X-WP-Nonce', plusmagiPostArchives.nonce);
					},
					success: function (response) {
						var buckets = { posts: [], categories: [], tags: [] };

						$.each(response, function (i, item) {
							if (item.type === 'post') {
								buckets.posts.push(item);
							} else if (item.original_type === 'category') {
								buckets.categories.push(item);
							} else if (item.original_type === 'post_tag') {
								buckets.tags.push(item);
							}
						});

						renderTabs(buckets);
					},
					error: function () {
						$results.empty()
							.append($('<div>').addClass('plusmagi-post-archives-error').text('Error retrieving results.'))
							.show();
						repositionDropdown();
					}
				});
			}, 300);
		});

		$(document).on('click', function (e) {
			if (!$(e.target).closest($wrapper).length && !$(e.target).closest($results).length) {
				$results.hide();
			}
		});
	});
});
