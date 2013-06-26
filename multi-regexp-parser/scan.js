(function (define) {
define(function (require) {

	/***** imports ******/

	var amd, fastForward, js, parser, subParser, exit, resume, countdown;

	amd = require('./parser/amd');

	fastForward = require('./parser/fastForward');
	js = require('./descriptor/javascript');
	parser = require('./parser');

	subParser = parser.subParser;
	exit = parser.exit;
	resume = parser.resume;
	countdown = parser.counter;

	/***** info collected in scanned file *****/

	var info, module;

	/*
		module.id, // module id, if any
		module.depList, // AMD dependencies specified in define()
		module.argList, // arguments passed to factory function (if any)
		module.requires, // id, pos, and length of r-val requires
		module.factory, // true if there is a factory function
		module.pos, // position of `define(...)`
		module.count // size of `define(...)` signature up to factory body
	 */

	/**
	 * Scans an AMD file, looking for modules.
	 * @param {String} source
	 * @returns {Array} array of module descriptors.
	 */
	function scanAmd (source) {
		var amdParser = amd.global;



		info = {
			modules: [],
			warnings: [],
			infos: []
		};
		module = null;
		parseGlobal(source);
		return info;
	}

	/***** common regexps *****/

	var removeCommentsRx, cleanDepsRx, splitArgsRx;

	removeCommentsRx = /\/\*[\s\S]*?\*\/|\/\/.*?[\n\r]/g;
	cleanDepsRx = /\s*["']\s*/g;
	splitArgsRx = /\s*,\s*/;

	/***** parsers *****/

	var parseGlobal, parseDefine, parseFactory;

	parseFactory = parser([
		{
			// TODO: look only for valid module ids?
			rx: /require\s*\(\s*["']([^"']+)["']\s*\)/g,
			action: before(
				parser.resume,
				[
					assertModule,
					function saveRequire (captures, source, index) {
						var id = captures[0];
						module.requires.push({
							id: id,
							pos: index,
							count: id.length
						});
					}
				]
			)
		},
		js.blockComment,
		js.lineComment,
		js.quotedString,
		js.dblQuotedString,
		js.regExp,
		// find end of factory function
		{ rx: /(\{)|(\})/, action: countdown('{', '}', exit, 1) }
	]);

	parseDefine = parser([
		{
			// id (with comma)
			// TODO: look only for valid module ids?
			rx: /(?:["']([^"']*)["']\s*,)/,
			action: before(
				parser.resume,
				[
					assertModule,
					function saveId (captures, source, index, nextIndex) {
						module.id = captures[0];
						module.count = nextIndex - module.pos;
					}
				]
			)
		},
		{
			// deps array (with comma)
			// TODO: look only for valid module ids?
			rx: /(?:\[([^\]]*?)\]\s*,)/,
			action: before(
				parser.resume,
				[
					assertModule,
					function saveDeps (captures, source, index, nextIndex) {
						module.depList = captures[0].replace(removeCommentsRx, '')
							.replace(cleanDepsRx, '')
							.split(splitArgsRx);
						module.count = nextIndex - module.pos;
					}
				]
			)
		},
		{
			// find "function name? (args?) {" OR "{"
			// args doesn't match on quotes ([^)\'"]*) to prevent this snippet
			// from lodash from capturing an extra quote:
			// `'function(' + x + ') {\n'`
			rx: /(?:(function)\s*[0-9a-zA-Z_$]*\s*\(([^)'"]*)\))?\s*\{/,
			action: before(
				subParser(parseFactory),
				[
					assertModule,
					function saveFactory (captures, source, index, nextIndex) {
						module.factory = !!captures[0]; // factory function?
						module.argList = captures[1].replace(removeCommentsRx, '').split(splitArgsRx);
						module.count = nextIndex - module.pos;
					}
				]
			)
		},
		js.blockComment,
		js.lineComment,
		js.quotedString,
		js.dblQuotedString,
		js.regExp,
		// find end of define(), typically after factory is [sub]parsed
		{
			rx: /(\()|(\))/,
			action: countdown(
				'(', ')',
				before(exit, function endModule () { module = null; }),
				1
			)
		}
	]);

	parseGlobal = parser([
		{
			// global "define("
			// TODO: don't match on foo.define(
			rx: /(\bdefine)\s*\(/,
			action: before(
				subParser(parseDefine),
				[
					refuteModule,
					function startModule (captures, source, index, nextIndex) {
						module = {
							pos: index,
							count: nextIndex - index,
							requires: []
						};
					}
				]
			)
		},
		js.blockComment,
		js.lineComment,
		js.quotedString,
		js.dblQuotedString,
		js.regExp,
	]);


	/***** export *****/

	return scanAmd;

	/***** other stuff *****/

	function assertModule (captures, source, index, nextIndex) {
		if (!module) throw new Error('Module declaration missing at file position ' + index);
	}

	function refuteModule (captures, source, index, nextIndex) {
		if (module) throw new Error('Duplicate module declaration found at file position ' + index);
	}

	function before (func, advice) {
		return function () {
			var args = arguments;
			if (!Array.isArray(advice)) advice = [advice];
			advice.forEach(function (a) { a.apply(args); });
			return func.apply(this, arguments);
		};
	}

/*
	function after (func, advice) {
		return function () {
			var result;
			result = func.apply(this, arguments);
			advice.apply(this, [result]);
			return result;
		};
	}
*/

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
