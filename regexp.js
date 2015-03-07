(function (define) {
	define(function () {

		return function (string) {
			return string.replace(/(^|-)(.)/g, function (m, d, c) {
				return d + c.toUpperCase();
			});
		}

	});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) {
		module.exports = factory();
	}
));