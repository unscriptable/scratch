(function (define) {
define(function (require) {

	var parser = require('./parser');

	/**
	 * Scans an AMD file, looking for modules.
	 * @param {String} source
	 * @returns {Array} array of module descriptors.
	 */
	function scanAmd (source) {
		// TODO
	}


	/***** common regexps *****/

	var quoteRx, dblQuoteRx, bCommentRx, lCommentRx, regexpRx, backslashRx;

	// quotes, but not escaped quotes
	quoteRx = /(')/;
	dblQuoteRx = /(")/;

	// block and line comments
	bCommentRx = /(\/\*)/;
	lCommentRx = /(\/{2})/;

	// regexp literals. To disambiguate division sign, check for leading
	// operators and a second slash on the same line.  This seems hairy. D:
	// TODO: count braces and parens that are captured here (use aop to decorate actions?)
	regexpRx = /([+\-*\/=,;%&|^!(\[\{<>])\s*(\/[^\/\n\r]+)/;

	backslashRx = /\\\\/;


	/***** skippers *****/

	var skipToEndQuote, skipToEndDblQuote, skipToEndBComment, skipToEndLComment,
		skipRegExp;

	skipToEndQuote = earlyEndingSkipper('\'', parser([
		// exit this parser when we hit an unescaped quote
		{ rx: /[^\\]'/, action: parser.exit },
		// ignore double-backslashes
		{ rx: backslashRx, action: parser.resume }
	]));

	skipToEndDblQuote = earlyEndingSkipper('"', parser([
		// exit this parser when we hit an unescaped double quote
		{ rx: /[^\\]"/, action: parser.exit },
		// ignore double-backslashes
		{ rx: backslashRx, action: parser.resume }
	]));

	skipToEndBComment = parser([
		{ rx: /\*\//, action: parser.exit }
	]);

	skipToEndLComment = parser([
		{ rx: /\n|\r|$/, action: parser.exit }
	]);

	skipRegExp = earlyEndingSkipper('/', parser([
		// look for unescaped slashes
		{ rx: /[^\\]\//, action: parser.exit },
		// ignore double-backslashes
		{ rx: backslashRx, action: parser.resume }
	]));

	function earlyEndingSkipper (earlyEnding, parser) {
		return function (source, index) {
			if (source[index] == earlyEnding) return index + 1;
			else return parser(source, index);
		}
	}


	/***** parsers *****/

	// TODO: add advice to the parsers to collect module info

	var parseGlobal, parseDefine, parseFactory;

	parseFactory = parser([
		{
			// TODO: look only for valid module ids?
			rx: /require\s*\(\s*["']([^"']+)["']\s*\)/g,
			action: function () {/* TODO */}
		},
		{ rx: bCommentRx, action: subParser(skipToEndBComment) },
		{ rx: lCommentRx, action: subParser(skipToEndLComment) },
		{ rx: quoteRx, action: subParser(skipToEndQuote) },
		{ rx: dblQuoteRx, action: subParser(skipToEndDblQuote) },
		{ rx: regexpRx, action: skipRegExp },
		// find end of factory function
		{ rx: /(\{)|(\})/, action: countdown(1, '{') }
	]);

	parseDefine = parser([
		{
			// id (with comma)
			// TODO: look only for valid module ids?
			rx: /(?:["']([^"']*)["']\s*,)/,
			action: function () {/* TODO */}
		},
		{
			// deps array (with comma)
			// TODO: look only for valid module ids?
			rx: /(?:\[([^\]]*?)\]\s*,)/,
			action: function () {/* TODO */}
		},
		{
			// find "function name? (args?) {" OR "{"
			// args doesn't match on quotes ([^)\'"]*) to prevent this snippet
			// from lodash from capturing an extra quote:
			// `'function(' + x + ') {\n'`
			rx: /(?:(function)\s*[0-9a-zA-Z_$]*\s*\(([^)'"]*)\))?\s*\{/,
			action: subParser(parseFactory)
		},
		{ rx: bCommentRx, action: subParser(skipToEndBComment) },
		{ rx: lCommentRx, action: subParser(skipToEndLComment) },
		{ rx: quoteRx, action: subParser(skipToEndQuote) },
		{ rx: dblQuoteRx, action: subParser(skipToEndDblQuote) },
		{ rx: regexpRx, action: skipRegExp },
		// find end of define()
		{ rx: /(\()|(\))/, action: countdown(1, '(') }
	]);

	parseGlobal = parser([
		{
			// global "define("
			// TODO: don't match on foo.define(
			rx: /(\bdefine)\s*\(/,
			action: subParser(parseDefine)
		},
		{ rx: bCommentRx, action: subParser(skipToEndBComment) },
		{ rx: lCommentRx, action: subParser(skipToEndLComment) },
		{ rx: quoteRx, action: subParser(skipToEndQuote) },
		{ rx: dblQuoteRx, action: subParser(skipToEndDblQuote) },
		{ rx: regexpRx, action: skipRegExp }
	]);


	/***** other stuff *****/

	function countdown (start, upMatch) {
		var count = start || 0;
		return function (captures) {
			// TODO: check all captures for multiple upMatch and dnMatch
			count += captures[0] == upMatch ? 1 : -1;
			return count == 0;
		}
	}

	function subParser (subParser) {
		return function (captures, source, index) {
			return subParser(source, index);
		};
	}

	return scanAmd;

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
