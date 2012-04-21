define(['when'], function (when) {

	var params = {};

	return {
		wire$plugin: function (a, b, c, d) {
			return {
//				create: function (promise, proxy) {
//					var path;
//					path = proxy.path;
//					if (proxy.spec.args) {
//						// save args
//					}
//					//if (proxy)
//				}
			};
			return {
				facets: {
					args: {
						initialize: function componentCreateFacet (resolver, facet, wire) {
							console.log('component create facet', facet.spec.wire.spec);
							resolver.resolve();
						}
					}
				},
				factories: {
					param: function paramFactory (resolver, spec, wire) {
cnosole.log(a, b, c, d);
						when(paramProvided(spec.param), resolver.resolve, resolver.reject);
					}
				}
			};
		}
	};

	function paramProvided (spec, name) {

	}

});
