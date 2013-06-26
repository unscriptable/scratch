(function (define) {
define(function (require) {

	var rxCompose = require('./rxCompose');

	/**
	 * Creates a function that will parse a source string for patterns and
	 * call "action" functions when those patterns are found.  Patterns
	 * must declare captures (via parentheses, e.g. /(foo)(bar)/ has two
	 * captures) or their actions will never be called.
	 *
	 * @param {Array} descriptors - an array of pattern-action descriptors.
	 *   Each is an object with an id, an `rx` property (RegExp), and an
	 *   `action` property.  When the RegExp matches a pattern, the action is
	 *   called. `action` will receive four arguments: (1) an array of the
	 *   captured text, one array item for each set of parentheses in the
	 *   RegExp; (2) the original source string; (3) this index where the
	 *   matched pattern was found, (4) the index at the next point in the
	 *   source string to resume parsing (one char ahead of the matched
	 *   pattern).
	 * @return {Object} - a parser with a parse function that takes a
	 *   source string and an optional starting index. parser also has
	 *   a method for each descriptor: the name of the method is the id of
	 *   the descriptor and the function is its action.
	 */
	function parser (descriptors) {
		var exitFlag, resumeFlag, regexps, actions, instance, comboRx;

		exitFlag = parser.exit();
		resumeFlag = parser.resume;

		regexps = [];
		actions = [];
		instance = {};

		// Decompose descriptors into ordered list of actions that each receive
		// arguments as if their associated regexp was the only regexp.
		descriptors.forEach(function (desc) {
			var start, len;

			if (!desc.id) throw new Error('Descriptor is missing id: ', desc);
			if (!desc.rx) throw new Error('Descriptor is missing rx: ', desc);

			regexps.push(desc.rx);
			instance[desc.id] = callAction;
			start = actions.length;

			len = rxCompose.length(desc.rx);
			while (len-- >= 0) actions.push(desc.id);

			function callAction (captures, source, index, nextIndex) {
				if (!desc.action) return resumeFlag;
				// extract the appropriate captures
				captures = captures.slice(start, len);
				return desc.action(captures, source, index, nextIndex);
			}
		});

		comboRx = rxCompose.compose(regexps, 'g');

		instance.parse = function (source, index) {
			var end, captures, nextIndex, result;
			comboRx.lastIndex = index || 0;
			end = false;
			while (!end && (captures = comboRx.exec(source))) {
				nextIndex = captures.index + 1;
				result = callFirstAction(captures, source, comboRx.lastIndex, nextIndex);
				// action returns `exitFlag` to abort at current index
				if (result == exitFlag) break;
				// action returns a number to skip ahead
				else if (parseInt(result, 10) > 0) comboRx.lastIndex = result;
			}
			return comboRx.lastIndex;
		};

		return instance;

		function callFirstAction (captures, source, index, nextIndex) {
			var i, capture;
			i = 0;
			// find the first matched capture and call the corresponding
			// method on this parser instance.
			while (i < captures.length) {
				capture = captures[i];
				if (typeof capture != 'undefined') {
					return instance[actions[i]](captures, source, index, nextIndex);
				}
			}
		}
	}

	// common actions

	/**
	 * This action will exit a parser.
	 */
	parser.exit = function () { return false; };

	/**
	 * This action will resume a parser (noop).
	 */
	parser.resume = function () { /*return undefined;*/ };

	/**
	 * Creates an action that is a sub-parser. When the sub-parser exits, it
	 * returns the index at which the parent parser will resume parsing.
	 * The actions for this sub-parser are not accessible.  Use the
	 * mergeSubParser function to create a subParser that exposes its actions.
	 * @param {Function} subParser
	 * @return {Function} action
	 */
	parser.subParser = function (subParser) {
		return function (captures, source, index, nextIndex) {
			return subParser.parse(source, nextIndex);
		};
	};

	/**
	 * Creates a countdown action that performs another action when a counter
	 * reaches zero. The counter increments when upMatch is captured and
	 * decrements when dnMatch is captured.
	 * @param {String} upMatch
	 * @param {String} dnMatch
	 * @param {Function} finalAction
	 * @param {Number} [startVal]
	 * @return {Function} action
	 */
	parser.counter = function (upMatch, dnMatch, finalAction, startVal) {
		var count = startVal || 0;
		return function (captures) {
			count = captures.reduce(function (c, m) {
				return c + (m == upMatch ? 1 : m == dnMatch ? -1 : 0);
			}, count);
			return count == 0 ? finalAction : parser.resume;
		}
	};

	/**
	 * Overrides an action with a subParser whose actions are cascaded to
	 * the parent parser.
	 * @param {Object} parser
	 * @param {Object} subParser
	 * @param {String} actionId
	 * @return {Object} parser
	 */
	parser.mergeSubParser = function (parser, subParser, actionId) {
		// override (or add) an action for this subParser
		parser[actionId] = function (captures, source, index, nextIndex) {
			return subParser.parse(source, index);
		};
		Object.keys(subParser).forEach(function (key) {
			var orig;
			if ('parse' != key && typeof subParser[key] == 'function') {
				orig = subParser[key].bind(subParser);
				// subParser calls parent's method
				subParser[key] = function (captures, source, index, nextIndex) {
					return parser[key](captures, source, index, nextIndex);
				};
				// parent calls original subParser method
				// TODO: what to do if there's already a parent method of this name?
				parser[key] = function (captures, source, index, nextIndex) {
					return orig(captures, source, index, nextIndex);
				}
			}
		});
		return parser;
	};

	return parser;

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
