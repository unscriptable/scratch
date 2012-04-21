define({

	$exports: {
		module: (function () { console.log('child'); return 1; }())
	},

	tableNode: {
		//param: 'param1'
	},

	plugin: { module: 'wire-component/wire/component' },
	debug: { module: 'wire/debug' }

});
