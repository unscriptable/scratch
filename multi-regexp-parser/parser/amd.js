(function (define) {
define(function (require) {

	var js, amd, parser;

	js = require('../descriptor/javascript');
	amd = require('../descriptor/amd');
	parser = require('../parser');

	return function () {
		var parseFactory, parseDefine, parseAmd;

		parseFactory = parser([
			amd.syncRequire,
			amd.factoryEnd,
			js.blockComment,
			js.lineComment,
			js.quotedString,
			js.dblQuotedString,
			js.regExp
		]);

		parseDefine = parser([
			amd.moduleId,
			amd.depsList,
			amd.factoryStart,
			amd.defineEnd,
			js.blockComment,
			js.lineComment,
			js.quotedString,
			js.dblQuotedString,
			js.regExp
		]);

		parser.mergeSubParser(parseDefine, parseFactory, 'parseFactory');

		// global parser
		parseAmd = parser([
			amd.defineStart,
			js.blockComment,
			js.lineComment,
			js.quotedString,
			js.dblQuotedString,
			js.regExp
		]);

		return parser.mergeSubParser(parseAmd, parseDefine, 'defineStart');
	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));