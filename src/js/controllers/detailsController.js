'use strict';

define(['js/router','js/marvelConnector', 'js/helper'], function (router, marvelConnector, helper) {
	helper.switchOverlay(true);

	var urlParams = router.routeHandler.getCurrentUrlParams();

    var categories = {
        "comics": "title",
        "characters": "name",
        "series": "title"
    };

    if(!categories[urlParams.category])
        window.location.hash = '/404';

    if(!(urlParams.id && Number.isInteger(parseInt(urlParams.id)))) {
        window.location.hash = '/404';
    }

    var options = {
        'id': urlParams.id 
    }

    marvelConnector.request(urlParams.category, options, function (data) {
        var model;

        model = data.results[0];

        if(model.series && model.series.items) {
            for(let item of model.series.items) {
                var resource = item.resourceURI.split('/');
                item.id = resource[resource.length - 1];
            }
        } else if (model.series && !model.series.items) {
            var resource = model.series.resourceURI.split('/');
            model.series.id = resource[resource.length - 1];
        }

        if(model.characters) {
            for(let character of model.characters.items) {
                var resource = character.resourceURI.split('/');
                character.id = resource[resource.length - 1];
            }
        }

        if(model.comics) {
            for(let comic of model.comics.items) {
                var resource = comic.resourceURI.split('/');
                comic.id = resource[resource.length - 1];
            }
        }

        var templateName = urlParams.category + "Details.html";

        require([`text!templates/${templateName}`], function (template) {
            var panel = document.getElementById('main-panel');
            panel.innerHTML = Mustache.render(template, model);
            var header = document.getElementById('header');
            header.innerHTML = model[categories[urlParams.category]]; 
            helper.switchOverlay(false);
        });
    }, function () {
        require(['text!templates/error.html'], function (template) {
            var model = {
                category: urlParams.category,
                id: urlParams.id
            };

            var panel = document.getElementById('main-panel');
            panel.innerHTML = Mustache.render(template, model);

            var header = document.getElementById('header');
            header.innerHTML = "Invalid Search";  

            helper.switchOverlay(false);
        });
    });
});