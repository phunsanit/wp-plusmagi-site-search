wp.blocks.registerBlockType( 'plusmagi-post-archives/search', {
	edit: function () {
		var el = wp.element.createElement;
		return el( 'div', { className: 'plusmagi-post-archives-editor-wrapper' },
			el( 'div', { style: { padding: '15px', border: '1px solid #ccc', background: '#f9f9f9', pointerEvents: 'none' } },
				el( 'strong', {}, 'PlusMagi Post Archives' ),
				el( 'input', {
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
				} )
			)
		);
	},
	save: function () {
		return null;
	},
} );
