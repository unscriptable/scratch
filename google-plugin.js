// my/googlemaps
var google;
define(function () {

	// notice callback=define
	var url = 'https://maps.googleapis.com/maps/api/js?key=MY_API_KEY&sensor=false&callback=define';

	return {
		load: function (absId, require, loaded, config) {
			require([url], function () {
				loaded(google.maps);
			});
		}
	};

});


define(['my/googlemaps'], function (gmaps) {
	console.log(gmaps.MapTypeId);
});
