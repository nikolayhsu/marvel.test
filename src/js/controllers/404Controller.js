'use strict';

define(['js/helper'], function (helper) {
	helper.switchOverlay(false);

    var count = 7;

    var interval = setInterval(function(){ 
        count--;

        var countdown = document.getElementById('countdown');

        if(countdown)
            countdown.innerHTML = count;

        if(count == 0) {
            clearInterval(interval);
            window.location.hash = '/';
        }

    }, 1000);
});