'use strict';

define(['js/router','js/marvelConnector', 'js/helper'], function (router, marvelConnector, helper) {
	helper.switchOverlay(true);

	var urlParams = router.routeHandler.getCurrentUrlParams();

    var options = {};

    var filters = {
        "comics": "title",
        "characters": "name",
        "series": "title"
    };

    if(!filters[urlParams.filter]) {
        window.location.hash = '/404';
        return;
    }

    options[filters[urlParams.filter]+'StartsWith'] = urlParams.query.replace(/_/g, " ");

    marvelConnector.request(urlParams.filter, options, function (data) {
        var model;

        if(urlParams.filter == "comics") {
            model = data.results;

            for(var x in model) {
                model[x].onSaleDate = new Date(model[x].dates[0].date).toAusDate();
            }
        }

        if(urlParams.filter == "characters") {
            model = data.results;
        }

        if(urlParams.filter == "series") {
            model = data.results;

            for(let series of model) {
                for (let [index, item] of series.comics.items.entries()) {
                    item.index = index + 1;
                }
            }
        }

        var templateName = urlParams.filter + "List.html";

        require([`text!templates/${templateName}`], function (template) {
            var panel = document.getElementById('main-panel');
            panel.innerHTML = Mustache.render(template, model);
            var header = document.getElementById('header');
            header.innerHTML = 'List of ' + urlParams.filter + ' --- ' + urlParams.query.replace(/_/g, " ");   
            helper.switchOverlay(false);
        });              
    });
});