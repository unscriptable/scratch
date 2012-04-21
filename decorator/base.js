define({

	comboTable: {
		wire: {
			spec: 'decorator/combo-spec',
			get: 'comboNode'
		},
		insert: { at: { $ref: 'dom.first!body' } }
	},
	tableNode: {
		render: {
			template: { module: 'text!decorator/table-template.html' }
		}
	},
	plugins: [
		{ module: 'wire/debug' },
		{ module: 'wire/dom' },
		{ module: 'wire/dom/render' }
	]

});
