jQuery(document).ready(function ($) {
	var $input = $('#plusmagi-site-search-input');
	var $results = $('#plusmagi-site-search-results');
	var timer;
	var activeTab = 'posts'; // Default tab

	// 1. Move results to body so z-index / overflow:hidden in parent themes
	//	cannot clip the dropdown.
	if ($results.length > 0 && !$results.parent().is('body')) {
		$('body').append($results);
	}

	// 2. Position dropdown beneath the input.
	//	Uses position:fixed + getBoundingClientRect() so the coordinates are
	//	relative to the viePMort and never need updating on scroll.
	//	This avoids the Firefox "scroll-linked positioning effect" warning
	//	caused by reading layout information inside a scroll event handler.
	   function repositionDropdown() {
		   if (!$input.is(':visible')) return;
		   var rect = $input[0].getBoundingClientRect();

		   $results.css({
			   'top': (rect.bottom + 4) + 'px',
			   'left': rect.left + 'px',
			   'width': rect.width + 'px',
			   'position': 'fixed',
			   'z-index': 999999
		   });
	   }

	// Reposition on resize and scroll so the dropdown tracks the input.
	$(window).on('resize scroll', function () {
		if ($results.is(':visible')) repositionDropdown();
	});

	// 3. Build a safe anchor element for a single result item.
	//	All dynamic content is set via .text() / .attr() to prevent XSS.
	function buildItem(item, mode) {
		var $li = $('<li>');
		var $a = $('<a>').attr('href', item.link);
		var $icon = $('<div>').addClass('plusmagi-site-search-item-icon');

		if (item.thumbnail) {
			$('<img>')
				.addClass('plusmagi-site-search-item-thumb')
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

		var $details = $('<div>').addClass('plusmagi-site-search-item-details');
		var $title = $('<span>').addClass('plusmagi-site-search-item-title').text(item.title);

		// Append status pill for non-published posts (text only, no raw HTML)
		if (mode !== 'term' && item.status && item.status !== 'publish') {
			$('<span>').addClass('plusmagi-site-search-status-pill').text(item.status).appendTo($title);
		}

		$details.append($title);

		if (mode === 'post') {
			$('<span>').addClass('plusmagi-site-search-item-info').text(item.date).appendTo($details);
		}

		$a.append($icon).append($details);
		$li.append($a);
		return $li;
	}

	// 4. Render a list of items into a <ul>
	function renderList(items, mode) {
		if (items.length === 0) {
			return $('<div>').addClass('plusmagi-site-search-no-results').text('No results found.');
		}
		var $ul = $('<ul>');
		$.each(items, function (i, item) {
			$ul.append(buildItem(item, mode));
		});
		return $ul;
	}

	// 5. Render the full tab UI and inject it into the results container
	function renderTabs(buckets) {
		$results.empty();

		// Tab headers
		var $tabs = $('<div>').addClass('plusmagi-site-search-tabs');
		$('<div>').addClass('plusmagi-site-search-tab').attr('data-tab', 'posts').text('Posts (' + buckets.posts.length + ')').appendTo($tabs);
		$('<div>').addClass('plusmagi-site-search-tab').attr('data-tab', 'categories').text('Category (' + buckets.categories.length + ')').appendTo($tabs);
		$('<div>').addClass('plusmagi-site-search-tab').attr('data-tab', 'tags').text('Tag (' + buckets.tags.length + ')').appendTo($tabs);

		// Tab panels
		var $panelPosts = $('<div>').addClass('plusmagi-site-search-tab-content').attr('id', 'tab-content-posts').hide().append(renderList(buckets.posts, 'post'));
		var $panelCats = $('<div>').addClass('plusmagi-site-search-tab-content').attr('id', 'tab-content-categories').hide().append(renderList(buckets.categories, 'term'));
		var $panelTags = $('<div>').addClass('plusmagi-site-search-tab-content').attr('id', 'tab-content-tags').hide().append(renderList(buckets.tags, 'term'));

		$results.append($tabs).append($panelPosts).append($panelCats).append($panelTags).show();

		switchTab(activeTab);
	}

	function switchTab(tabName) {
		activeTab = tabName;
		$results.find('.plusmagi-site-search-tab').removeClass('active');
		$results.find('.plusmagi-site-search-tab[data-tab="' + tabName + '"]').addClass('active');

		$results.find('.plusmagi-site-search-tab-content').hide();
		$results.find('#tab-content-' + tabName).show();
		repositionDropdown();
	}

	// 6. Event delegation for tab clicks
	$results.on('mousedown', '.plusmagi-site-search-tab', function (e) {
		e.preventDefault(); // Prevent input blur before the click registers
		switchTab($(this).data('tab'));
	});

	$input.on('focus', function () {
		if ($(this).val().length >= 2 && $results.children().length > 0) {
			$results.show();
			repositionDropdown();
		}
	});

	// 7. Main search handler
	   $input.on('input', function () {
		   var term = $(this).val();
		   clearTimeout(timer);

		   if (term.length < 2) {
			   $results.hide().empty();
			   return;
		   }

		   repositionDropdown();

		   timer = setTimeout(function () {
			   $.ajax({
				url: plusmagiSiteSearch.root + 'plusmagi-site-search/v1/search',
				   method: 'GET',
				   data: { term: term },
				   beforeSend: function (xhr) {
					   xhr.setRequestHeader('X-PM-Nonce', plusmagiSiteSearch.nonce);
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
						   .append($('<div>').addClass('plusmagi-site-search-error').text('Error retrieving results.'))
						   .show();
					   repositionDropdown();
				   }
			   });
		   }, 300);
	   });

	// 8. Close dropdown when clicking outside the widget
	   $(document).on('click', function (e) {
		   if (
			!$(e.target).closest('#plusmagi-site-search-input').length &&
			!$(e.target).closest('#plusmagi-site-search-results').length
		   ) {
			   $results.hide();
		   }
	   });
});
