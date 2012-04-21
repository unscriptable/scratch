define({

	tableNode: { $ref: 'splitTable' }, // alias

	splitterNode: {
		render: { template: { module: 'text!decorator/splitter-template.html' } }
	},
	table2: {
		getElement: { $ref: 'tableNode' },
		insert: { at: { $ref: 'dom.first!.splitter-body' } }
	},
	tableHeader: {
		cloneElement: { $ref: 'dom.first!thead', at: { $ref: 'tableNode' } },
		insert: { at: { $ref: 'dom.first!.splitter-header table' } }
	},
	plugins: [
		{ module: 'wire/debug' },
		{ module: 'wire/dom', at: { $ref: 'splitterNode' } },
		{ module: 'wire/dom/render' }
	]

});
