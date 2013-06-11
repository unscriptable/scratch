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
	 *   `action` will receive three arguments: (1) an array of the captured
	 *   text, one array item for each set of parentheses in the RegExp;
	 *   (2) the original source string; (3) the index at the next point in
	 *   the source string to resume parsing (one char ahead of the last
	 *   match).
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
				result = callFirstAction(captures, source, nextIndex);
				// action returns `exitFlag` to abort at current index
				if (result == exitFlag) break;
				// action returns a number to skip ahead
				else if (result > 0) comboRx.lastIndex = result;
			}
			return comboRx.lastIndex;
		};

		function callFirstAction (captures, source, nextIndex) {
			var i, capture;
			i = 0;
			// find the first matched capture and call its action
			while (i < captures.length) {
				capture = captures[i];
				if (typeof capture != 'undefined') {
					return actions[i](captures, source, nextIndex);
				}
			}
		}
	}

	parser.exit = function () { return false; };
	parser.resume = function () { };

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
