(function (define) {
define(function (require) {

	var parser, exit, resume;

	parser = require('../parser');
	exit = parser.exit;
	resume = parser.resume;

	var ffToQuote, ffToDblQuote, ffToCloseComment, ffToLineEnding,
		ffToRegexpEnding, backslashRx;

	backslashRx = /\\\\/;

	ffToQuote = earlyEndingSkipper('\'', parser([
		// exit this parser when we hit an unescaped quote
		{ rx: /[^\\]'/, action: exit, id: 'quote' },
		// ignore double-backslashes
		{ rx: backslashRx, action: resume, id: 'backslashes' }
	]));

	ffToDblQuote = earlyEndingSkipper('"', parser([
		// exit this parser when we hit an unescaped double quote
		{ rx: /[^\\]"/, action: exit, id: 'dblQuote' },
		// ignore double-backslashes
		{ rx: backslashRx, action: resume, id: 'backslashes' }
	]));

	ffToCloseComment = parser([
		{ rx: /\*\//, action: exit, id: 'endComment' }
	]);

	ffToLineEnding = parser([
		{ rx: /\n|\r|$/, action: exit, id: 'lineEnding' }
	]);

	ffToRegexpEnding = earlyEndingSkipper('/', parser([
		// look for unescaped slashes
		{ rx: /[^\\]\//, action: exit, id: 'slash' },
		// ignore double-backslashes
		{ rx: backslashRx, action: resume, id: 'backslashes' }
	]));

	function earlyEndingSkipper (earlyEnding, parser) {
		return function (source, index) {
			// detect an early end to this parser (e.g. empty string)
			if (source[index] == earlyEnding) return index + 1;
			else return parser(source, index);
		}
	}

	return {
		quote: ffToQuote,
		dblQuote: ffToDblQuote,
		endComment: ffToCloseComment,
		lineEnd: ffToLineEnding,
		regExpEnd: ffToRegexpEnding
	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));