'use strict';

define([], function () {
	var self = {};

	self.switchOverlay = function (isShown) {
	    var overlay = document.getElementById('overlay');

	    if(overlay)
	    	overlay.style.display = isShown ? "block" : "none";
	}

	return self;
});