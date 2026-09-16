(function (blocks, element) {
	var el = element.createElement;
	var registerBlockType = blocks.registerBlockType;

	registerBlockType('plusmagi-post-archives/search', {
		title: 'PlusMagi Post Archives',
		icon: 'calendar-alt',
		category: 'widgets',
		description: 'A monthly selector for WordPress post archives grouped by year.',
		keywords: ['archives', 'month', 'year', 'plusmagi-post-archives'],
		example: {},
		edit: function () {
			       return el('div', { className: 'plusmagi-post-archives-editor-wrapper' },
				       el('strong', {}, 'PlusMagi Post Archives'),
				       el('p', {}, 'Monthly archive selector grouped by year.')
			);
		},
		save: function () {
			return null; // Return null to render via PHP
		},
	});
})(window.wp.blocks, window.wp.element);
