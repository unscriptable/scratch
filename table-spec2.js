// Parameterized table options

// table factory connected to a controller and bound to an adapter
define({
	plugins: [
		{ module: 'wire/render/table' /* or whatever */ },
		{ module: 'wire/dojo/connect' },
		{ module: 'wire/cola' }
	],
	myTable: {
		// table factory
		table: {
			// optional template of table shell. auto-generated if missing.
			template: { module: 'text!template.html' },
			// optional css
			css: { module: 'css!structure.css' },
			// column definitions
			cols: {
				last: { className: 'last-col' },
				first: { className: 'first-col' },
				// note: unless cols are named identically to bindings, ctrlr
				// won't easily know what column was clicked.
				isApproved: {
					template: '<td class="approved-col"><input type="checkbox"/></td>'
				}
			},
			layout: 'fixed' // should probably be fixed by default, actually
		},
		bindings: {
			last: { node: '.last-col', prop: 'innerHTML' },
			first: { node: '.first-col', prop: 'innerHTML' },
			approved: { node: '.approved-col input', prop: 'checked' }
		},
		bind: { $ref: 'storeAdapter' }
	},
	storeAdapter: { /* blah blah blah */ },
	controller: {
		create: { module: 'ctrlr' },
		properties: {
			_table: { $ref: 'myTable' },
			_adapter: { $ref: 'storeAdapter' }
		},
		connect: {
			// tableClicked digs into event target and somehow finds the field
			// name and constructs a new comparator and sets it on the table.
			myTable: { click: 'tableClicked' }
		},
		// ready calls a method that sets initial sort order on the table.
		ready: 'setSort'
	}
});

// TableAdapter bound to an store adapter
define({
	plugins: [
		{ module: 'wire/cola' },
		{ module: 'wire/dom/render' }
	],
	tableView: {
		render: {
			// normal wire/dom/render template with data-cola-role="item-template"
			// custom isApproved cell template is baked in
			template: 'text!template.html',
			css: 'css!structure.css'
		},
		bindings: {
			last: { node: '.last-col', prop: 'innerHTML' },
			first: { node: '.first-col', prop: 'innerHTML' },
			approved: { node: '.approved-col input', prop: 'checked' }
		}
	},
	tableAdapter: {
		create: {
			module: 'cola/TableAdapter',
			args: [
				// if this node is undefined or not a table, TableAdapter will
				// use some logic to generate a table. similarly, if there
				// are no predefined cols, Tableview will generate some.
				{ $ref: 'tableView' },
				{
					// column definitions
					cols: {
						last: { className: 'last-col' },
						first: { className: 'first-col' },
						approved: {
							template: '<td class="approved-col"><input type="checkbox"/></td>'
						}
					},
					sort: { approved: -1, last: 2, first: 3 }
				}
			]
		},
		bind: { $ref: 'tableView' }
	},
	storeAdapter: { /* blah blah blah */ }
});

// TableAdapter that creates its own node
define({
	plugins: [
		{ module: 'wire/cola' },
		{ module: 'wire/dom/render' }
	],
	tableAdapter: {
		create: {
			module: 'cola/TableAdapter',
			args: [
				// if this node is undefined or not a table, TableAdapter will
				// use some logic to generate a table. similarly, if there
				// are no predefined cols, Tableview will generate some.
				{ $ref: 'tableView' },
				{
					// column definitions
					cols: {
						last: { className: 'last-col', prop: 'innerHTML' },
						first: { className: 'first-col', prop: 'innerHTML' },
						approved: {
							template: '<td class="approved-col"><input type="checkbox"/></td>',
							node: '.approved-col input', prop: 'checked'
						}
					},
					sort: { approved: -1, last: 2, first: 3 },
					template: 'text!template.html',
					css: 'css!structure.css'
				}
			]
		},
		bind: { $ref: 'tableView' }
	},
	storeAdapter: { /* blah blah blah */ }
});
