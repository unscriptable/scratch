(function (define) {
define(function (require) {

	/**
	 * Creates a function that will parse a source string for patterns and
	 * call "action" functions when those patterns are found.  Patterns
	 * must declare captures (via parentheses, e.g. /(foo)(bar)/ has two
	 * captures) or their actions will never be called.
	 *
	 * @param {Array} descriptors - an array of pattern-action descriptors.
	 *   Each is an object with an `rx` property (RegExp) and an `action`
	 *   property.  When the RegExp matches a pattern, the action is called.
	 *   `action` will receive four arguments: (1) an array of the captured
	 *   text, one array item for each set of parentheses in the RegExp;
	 *   (2) the original source string; (3) this index where the matched
	 *   pattern was found, (4) the index at the next point in the source
	 *   string to resume parsing (one char ahead of the matched pattern).
	 * @return {Function} - parsing function that takes a source string and an
	 *   optional starting index.
	 */
	function parser (descriptors) {
		var exitFlag, regexps, actions, comboRx;

		exitFlag = parser.exit();

		regexps = [];
		actions = [];

		// Decompose descriptors into ordered list of actions that each receive
		// arguments as if their associated regexp was the only regexp.
		descriptors.forEach(function (pattern) {
			var start, len;

			regexps.push(pattern.rx);
			start = actions.length;
			len = rxLength(pattern.rx);

			while (len-- >= 0) {
				actions.push(actionWithSlicedCaptures);
			}

			function actionWithSlicedCaptures (captures, source, index) {
				captures = captures.slice(start, len);
				return pattern.action(captures, source, index);
			}
		});

		comboRx = rxCompose(regexps, 'g');

		return function (source, index) {
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

		function callFirstAction (captures, source, index, nextIndex) {
			var i, capture;
			i = 0;
			// find the first matched capture and call its action
			while (i < captures.length) {
				capture = captures[i];
				if (typeof capture != 'undefined') {
					return actions[i](captures, source, index, nextIndex);
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
	 * @param {Function} subParser
	 * @return {Function} action
	 */
	parser.subParser = function (subParser) {
		return function (captures, source, index, nextIndex) {
			return subParser(source, nextIndex);
		};
	};

	/**
	 * Creates a countdown action that performs an action when a counter reaches
	 * zero. The counter increments when upMatch is captured and decrements
	 * when dnMatch is captured.
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

	return parser;

	/**
	 * Composes an array of RegExp into a single RegExp.
	 * @param {Array} rxs - array of RegExp
	 * @param {String} [options] - for instance 'g', 'm', 'i', 'gi', etc.
	 * @return {RegExp}
	 */
	function rxCompose (rxs, options) {
		var composed;
		if (arguments.length < 2) options = '';
		composed = rxs.map(function (rx) {
			return rx.toString().replace(/^\/|\/$/g, '');
		});
		return new RegExp(composed.join('|'), options);
	}

	/**
	 * Determines how many captures a RegExp has.
	 * @private
	 * @param {RegExp} rx
	 * @return {Number}
	 */
	function rxLength (rx) {
		var rxTest, result;
		// `/foo/` ensures that we will match "foo" since we need a successful
		// search to figure out how many captures there are.
		rxTest = rxCompose([rx, /foo/]);
		result = rxTest.exec('foo');
		// result[0] is full match so don't count that.
		return result.length - 1;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
