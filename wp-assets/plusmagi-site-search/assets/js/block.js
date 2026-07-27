(function (blocks, element) {
	var el = element.createElement;
	var registerBlockType = blocks.registerBlockType;

	registerBlockType('plusmagi-site-search/search', {
		   title: 'PlusMagi Site Search',
		   icon: 'search',
		   category: 'widgets',
		   description: 'A dedicated search box with role-based access control.',
		keywords: ['search', 'find', 'plusmagi-site-search'],
		   example: {},
		   edit: function () {
			   return el('div', { className: 'plusmagi-site-search-editor-wrapper' },
				   el('div', { style: { padding: '15px', border: '1px solid #ccc', background: '#f9f9f9', pointerEvents: 'none' } },
					   el('strong', {}, 'PlusMagi Site Search'),
					   el('input', {
						   type: 'text',
						   placeholder: 'Search...',
						   disabled: true,
						   style: {
							   width: '100%',
							   marginTop: '10px',
							   padding: '8px',
							   borderRadius: '4px',
							   border: '1px solid #ddd'
						   }
					   })
				   )
			   );
		   },
		   save: function () {
			   return null; // Return null to render via PHP
		   },
	   });
})(window.wp.blocks, window.wp.element);
