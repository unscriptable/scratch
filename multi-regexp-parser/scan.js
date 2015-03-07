(function (define) {
define(function (require) {

	/***** imports ******/

	var amdParser;

	amdParser = require('./parser/amd');

	/***** common regexps *****/

	var removeCommentsRx, cleanDepsRx, splitArgsRx;

	removeCommentsRx = /\/\*[\s\S]*?\*\/|\/\/.*?[\n\r]/g;
	cleanDepsRx = /\s*["']\s*/g;
	splitArgsRx = /\s*,\s*/;

	/*
		module.id, // module id, if any
		module.depList, // AMD dependencies specified in define()
		module.argList, // arguments passed to factory function (if any)
		module.requires, // id, pos, and length of r-val requires
		module.factory, // true if there is a factory function
		module.pos, // position of `define(...)`
		module.count // size of `define(...)` signature up to factory body
	 */

	var parser, info, module;

	// create and add advice to amd parser functions

	parser = amdParser();

	parser.syncRequire = before(
		parser.syncRequire,
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
	);

	parser.moduleId = before(
		parser.moduleId,
		[
			assertModule,
			function saveId (captures, source, index, nextIndex) {
				module.id = captures[0];
				module.count = nextIndex - module.pos;
			}
		]
	);

	parser.depsList = before(
		parser.depsList,
		[
			assertModule,
			function saveDeps (captures, source, index, nextIndex) {
				module.depList = captures[0].replace(removeCommentsRx, '')
					.replace(cleanDepsRx, '')
					.split(splitArgsRx);
				module.count = nextIndex - module.pos;
			}
		]
	);

	parser.factoryStart = before(
		parser.factoryStart,
		[
			assertModule,
			function saveFactory (captures, source, index, nextIndex) {
				module.factory = !!captures[0]; // factory function?
				module.argList = captures[1].replace(removeCommentsRx, '').split(splitArgsRx);
				module.count = nextIndex - module.pos;
			}
		]
	);

	parser.startDefine = before(
		parser.startDefine,
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
	);


	/**
	 * Scans an AMD file, looking for modules.
	 * @param {String} source
	 * @returns {Array} array of module descriptors.
	 */
	function scanAmd (source) {

		// set up info collected in scanned file

		info = {
			modules: [],
			warnings: [],
			infos: []
		};
		module = null;

		// go!
		amdParser(source);

		return info;

	}


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
