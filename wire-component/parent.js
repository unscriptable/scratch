define({

	child: {
		wire: {
			spec: 'wire-component/component',
			get: '$exports'
		},
		args: {
			//param1: { $ref: 'foo' }
		}
	},

	foo: document,

	bar: { $ref: 'foo' },

	myFunc: {
		expr: {
			body: 'alert(e.target.textContent);',
			params: ['e']
		}
	},

	body: {
		getElement: document.body,
		states: {
			foo: ['on:foo-on', 'off:foo-off'],
			bar: ['true:bar-on', 'false:bar-off']
		},
		init: {
			addEventListener: [
				'mouseover',
				{ $ref: 'expr!this.style.color="red";' },
				false
			]
		},
		ready: {
			addEventListener: [
				'click',
				{ $ref: 'myFunc' },
				false
			]
		},
		insert: {
			at: document
		}
	},

	plugin: { module: 'wire-component/wire/component' },
	expr: { module: 'wire-expr/expr' },
	css: { module: 'wire-css/css' },
	dom: { module: 'wire/dom' },
	debug: { module: 'wire/debug' }

});
