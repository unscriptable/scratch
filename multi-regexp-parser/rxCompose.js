(function (define) {
define(function () {

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

	return {
		compose: rxCompose,
		length: rxLength
	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));