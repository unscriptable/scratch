define('manual', function () {

	var obj1 = {
		aFunc: function () {}
	};

	function decorate (obj) {

		var orig = obj.aFunc;

		obj.aFunc = function override () {};

		return obj;
	}

	function again (obj) {

		var orig = obj.aFunc;

		obj.aFunc = function override2 () {};

		return obj;
	}

	return again(decorate(ob1));
});

define('wat', function () {

	var obj1 = {
		aFunc: function () {}
	};

	function decorate (obj) {

		var orig = obj.aFunc;

		obj.aFunc = function override () {};

		override.remove = function () {
			obj.aFunc = orig;
		};

		return obj;
	}


});

define('remover', function () {

	var obj1 = {
		aFunc: function () {}
	};

	function decorate (obj, override) {

		var orig = obj.aFunc;

		obj.aFunc = override;

		override.remove = function () {
			obj.aFunc = orig;
		};

		return obj;
	}


});
