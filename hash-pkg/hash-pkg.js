// loaders/hash-pkg
define(function () {
"use strict";

	return {

		load: function (absId, require, loaded, config) {
			var url, normalized;

			// resolve the url for this module
			url = require.toUrl(absId);

			// remove the hash and stuff :)
			normalized = normalizeUrl(url);

			// fetch the base url as plain javascript
			require(['js!' + normalized], function () {

				// use the R-Value require to get the module.
				// this works since it's already loaded.
				loaded(require(absId));

			});

		}

	};

	function normalizeUrl (url) {
		return url.split('#')[0];
	}

});

// configure curl.js to use the hash-pkg loader for all modules in the
// packages that are built. I guess you probably generate path info from your
// custom config settings, but if you change it to generate package
// descriptors, you could include the moduleLoader property in the descriptors.
// I didn't test any of this code, but this could possibly work!
curl({
	packages: [
		{
			name: 'base',
			location: '/script/8bf0733017bcc1f955897aee802e7004/base/package.min.js#',
			moduleLoader: 'loaders/hash-pkg'
		},
		{
			name: 'jquery_common',
			location: '/script/ff7a599184c5261c1aa7b52ae269ca43/jquery_common/package.min.js#',
			moduleLoader: 'loaders/hash-pkg'
		}
	]
});