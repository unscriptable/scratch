define({

	myHub: {
		create: {
			module: 'cola/Hub',
			args: {
				// targetFirstItem is the only strategy option you might
				// need at this time. only include it if you are using
				// "target" events and need cola to target the first item
				// as soon as dat is synced in the network.
				strategyOptions: { targetFirstItem: true }
			}
		}
	},

	myView: {
		// this is just a simple HTML view. typically, you'll be rendering
		// data to the browser's DOM and this is an easy way to do it.
		render: {
			// an html template is required. this may be an inline string.
			template: { module: 'text!my/view/template.html' },
			// "replace" is an object containing key-value pairs. tokens
			// are found and replaced in the html template.  the tokens must
			// be look like this: ${key}. tokens are replaced with the values
			// in the replace object, if found.  they are left blank if not
			// found.  example: <label>${labels.firstName}</label>
			replace: { module: 'i18n!my/view/strings' },
			// css is optional, but recommended
			css: { module: 'css!my/view/template.css' }
		},
		bind: {
			// you MUST bind to a hub's network
			to: { $ref: 'myHub' },
			// identifier and comparator are required at this time, but
			// will be optional in a future release of cola
			identifier: { $ref: 'identifier' },
			comparator: { $ref: 'comparator' },
			// itemTemplateSelector is a CSS3 selector used to find the
			// element in the template that will be cloned to create a
			// representation of each data item.  itemTemplateSelector is
			// only necessary if your template does not
			// include an element with a "cola role" attribute:
			// data-cola-role="item-template"
			itemTemplateSelector: '.actions-button',
			bindings: {
				// these are the mappings of data attributes to DOM nodes.
				// each property corresponds with the name of data item
				// attribute.
				// the "node" property describe CSS3 selectors used to find
				// the element that corresponds to a particular attribute.
				firstName: { node: '.first-name' },
				lastName: { node: '.last-name' },
				age: { node: '.age' }
			}
		}
	},

	myData: {
		// some sort of data source that supports a subset of the cola API
		// e.g. "add", "remove", "update" (otherwise, it needs an adapter)
		create: {
			module: 'my/rest/client',
			args: {
				target: 'api/my-data/'
			}
		},
		bind: {
			to: { $ref: 'myHub' },
			// this is required for a data source to push it's data onto the
			// network
			provide: true
		},
		ready: {
			query: 'lastName LIKE A*'
		}
	},

	identifier: {
		// configure an identifier function so cola can uniquely identify
		// data items.
		create: {
			module: 'cola/relational/propertiesKey',
			args: 'name'
		}
	},

	comparator: {
		// configure a comparator function so cola can sort data items.
		create: {
			module: 'cola/comparator/byProperty',
			args: 'order'
		}
	},

	plugins: [
		// needed for "bind" facet
		{ module: 'wire/cola' },
		// needed for "render" facet
		{ module: 'wire/dom/render' }
	]
});


define({

	hub2: {
		create: {
			module: 'cola/Hub',
			args: { $ref: 'resource!restful/endpoint' }
		},
		init: {
			setEventsHub: { $ref: 'events2' }
		}
	},

	events2: {},

	plugins: [
		{ module: 'wire/cola' }
	]
});
