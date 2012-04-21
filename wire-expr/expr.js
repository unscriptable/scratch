(function (define) {
define(['when'], function (when) {
"use strict";

	/**
	 * Create a new function from JSON-compatible strings.
	 * @param [params] {Array} names of the formal parameters
	 * @param body {String} body of function
	 * @returns {Function}
	 */
	function exprToFunc (params, body) {
		var args;
		// if no body, params is the body
		args = arguments.length > 1 ? params.concat(body) : [params];
		// return a function
		return Function.apply(this, args);
	}

	exprToFunc.wire$plugin = function (ready, destroyed, options) {
		return {

			resolvers: {
				expr: exprResolver,
					expression: exprResolver
			},

			factories: {
				expr: exprFactory
			}

		}
	};

	return exprToFunc;

	function exprFactory (resolver, spec, wire) {
		when(wire(spec.expr), function (options) {
			if (typeof options == 'string') {
				return exprToFunc(options);
			}
			else {
				return createExpr(options);
			}
		}).then(resolver.resolve, resolver.reject);
	}

	function exprResolver (resolver, expression, refObj, wire) {
		when(wire(refObj.params), function (params) {
			return createExpr({ body: expression, params: params });
		}).then(resolver.resolve, resolver. reject);
	}

	function createExpr (options) {
		var params, body;
		body = options.body || options.js || options.$ref;
		params = options.params && [].concat(options.params) || [];
		return exprToFunc(params, body);
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (deps, factory) { module.exports = factory(deps.map(require)); }
));