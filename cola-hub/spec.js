define({

	data: [
		{ id: 11, name: 'izzy' },
		{ id: 8, name: 'suzy' },
		{ id: 6, name: 'decker' }
	],

	dataAdapter: {
		create: {
			module: 'cola/ArrayAdapter',
			args: { $ref: 'data' }
		}/*,
		bind: { $ref: 'nodelist' }*/
	},

	nodelist: {
		render: {
			template: '<ul><li><span></span></li></ul>'
		},
		bindings: {
			name: { node: 'span', prop: 'innerHTML' }
		},
		insert: { at: document.body },
		bind: { $ref: 'dataAdapter' }
	},

	plugins: [
		//{ module: 'wire/debug' },
		{ module: 'wire/dom' },
		{ module: 'wire/dom/render' },
		{ module: 'wire/cola', itemTemplateSelector: 'li' }
	]
});