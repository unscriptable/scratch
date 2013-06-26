(function (define) {
define(function (require) {

	var parser, exit, countdown;

	parser = require('../parser');

	exit = parser.exit;
	countdown = parser.counter;

	/***** inside `define(` *****/

	var moduleId, depsList, factoryStart, defineEnd;

	moduleId = {
		// id (with comma)
		// TODO: look only for valid module ids?
		rx: /(?:["']([^"']*)["']\s*,)/,
		id: 'moduleId'
	};

	depsList = {
		// deps array (with comma)
		// TODO: look only for valid module ids?
		rx: /(?:\[([^\]]*?)\]\s*,)/,
		id: 'depsList'
	};

	factoryStart = {
		// find "function name? (args?) {" OR "{"
		// args doesn't match on quotes ([^)\'"]*) to prevent this snippet
		// from lodash from capturing an extra quote:
		// `'function(' + x + ') {\n'`
		rx: /(?:(function)\s*[0-9a-zA-Z_$]*\s*\(([^)'"]*)\))?\s*\{/,
		id: 'factoryStart'
	};

	// find end of define(), typically after factory is [sub]parsed
	defineEnd = {
		rx: /(\()|(\))/,
		id: 'defineEnd',
		action: countdown('(', ')', exit, 1)
	};

	/***** inside factory function *****/

	var syncRequire, factoryEnd;

	syncRequire = {
		// TODO: look only for valid module ids?
		rx: /require\s*\(\s*["']([^"']+)["']\s*\)/g,
		id: 'syncRequire'
	};

	// find end of factory function
	factoryEnd = {
		rx: /(\{)|(\})/,
		id: 'factoryEnd',
		action: countdown('{', '}', exit, 1)
	};

	/***** global scope *****/

	var defineStart;

	// global "define("
	// TODO: don't match on foo.define(
	defineStart = {
		rx: /(\bdefine)\s*\(/,
		id: 'defineStart'
	};

	/***** export *****/

	return {
		moduleId: moduleId,
		depsList: depsList,
		factoryStart: factoryStart,
		defineEnd: defineEnd,
		syncRequire: syncRequire,
		factoryEnd: factoryEnd,
		defineStart: defineStart
	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));