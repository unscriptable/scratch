(function (define) {
define(function (require) {

	var fastForward, parser, subParser;

	fastForward = require('../parser/fastForward');
	parser = require('../parser');
	subParser = parser.subParser;

	var quoteRx, dblQuoteRx, bCommentRx, lCommentRx, regExpRx;

	// quotes
	quoteRx = /(')/;
	dblQuoteRx = /(")/;

	// block and line comments
	bCommentRx = /(\/\*)/;
	lCommentRx = /(\/{2})/;

	// regexp literals. To disambiguate division sign, check for leading
	// operators and a second slash on the same line.  This seems hairy. D:
	regExpRx = /([+\-*\/=,;%&|^!(\[\{<>])\s*(\/[^\/\n\r]+)/;

	return {
		blockComment: {
			rx: bCommentRx,
			id: 'blockComment',
			action: subParser(fastForward.endComment)
		},
		lineComment: {
			rx: lCommentRx,
			id: 'lineComment',
			action: subParser(fastForward.lineEnding)
		},
		quotedString: {
			rx: quoteRx,
			id: 'quotedString',
			action: subParser(fastForward.quote)
		},
		dblQuotedString: {
			rx: dblQuoteRx,
			id: 'dblQuotedString',
			action: subParser(fastForward.dblQuote)
		},
		regExp: {
			rx: regExpRx,
			id: 'regExp',
			action: subParser(fastForward.regExpEnd)
		}
	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));