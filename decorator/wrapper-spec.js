define({

	tableNode: { $ref: 'wrappedTable' }, // alias

	wrapperNode: {
		render: { template: { module: 'text!decorator/wrapper-template.html' } }
	},
	plugins: [
		{ module: 'wire/debug' },
		{ module: 'wire/dom/render' }
	]


});
