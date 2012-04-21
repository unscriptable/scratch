define({

	// aliases
	splitTable: { $ref: 'tableNode' },
	wrappedTable: { $ref: 'tableNode' },
	comboNode: { $ref: 'tableWrapper' },

	tableWrapper: {
		wire: {
			spec: 'decorator/wrapper-spec',
			get: 'wrapperNode'
		}
	},
	tableSplitter: {
		wire: {
			spec: 'decorator/splitter-spec',
			get: 'splitterNode'
		},
		insert: { at: { $ref: 'tableWrapper' } }
	},

	plugins: [
		{ module: 'wire/debug' },
		{ module: 'wire/dom' }
	]

});
