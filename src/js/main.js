require.config({
    paths: {
        'text': '/lib/js/text',
        'lib': '/lib/js',
        'js': '/src/js',
        'partials': '/partials',
        'templates': '/templates'
    }
});

require(
    [
        'js/router',
        'js/marvelConnector'
    ],
    function (router, marvelConnector) {
        // Listen on hash change:
        window.addEventListener('hashchange', router.routeHandler.router);

        var switchOverlay = function (isShown) {
            var overlay = document.getElementById('overlay');

            overlay.style.display = isShown ? "block" : "none";
        }

        router.routeProvider.register('/404', '404', function (urlParams) {
            switchOverlay(false);

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

        router.routeProvider.register('/', 'home', function (urlParams) {
            var submitSearch = function (event) {
                if(!event)
                    return;

                if(event.type == "keyup" && event.keyCode != 13)
                    return;

                var query = document.getElementById('search-query').value.trim();
                var filter = document.getElementById('filter').value.trim();

                query = query.replace(/ /g, "_");

                if(query.trim().length < 3) {
                    var alertMessage = document.getElementsByClassName("alert-danger")[0];

                    if(alertMessage) {
                        alertMessage.style.display = "block";
                    }

                    return;
                }

                window.location.hash = `/comics/list/${filter}/${query}`;
            };

            var getSuggestions = function () {
                var query = document.getElementById('search-query').value.trim();
                var filter = document.getElementById('filter').value.trim();
                var searchResults = document.getElementById('search-results');

                searchResults.innerHTML = '';

                if(query.length == 0)
                    return;

                var filters = {
                    "comics": "title",
                    "characters": "name",
                    "series": "title"
                };

                var options = {
                    'limit': 5
                };

                options[filters[filter] + 'StartsWith'] = query;

                marvelConnector.request(filter, options, function (data) {
                    var model;

                    if(filter == "comics") {
                        model = data.results;

                        for(var x in model) {
                            model[x].filter = filter;
                        }
                    }

                    if(filter == "characters") {
                        model = data.results;
                        if(model) {
                            for (let character of model) {
                                character.filter = filter;   
                            }
                        }
                    }

                    if(filter == "series") {
                        model = data.results;

                        for(let item of model) {
                            item.filter = filter;
                        }
                    }

                    require([`text!templates/searchResults.html`], function (template) {
                        searchResults.innerHTML = Mustache.render(template, model);
                    });
                });
            }

            var bindElements = function () {
                var goButton = document.getElementById('go-button');
                var searchQuery = document.getElementById('search-query');
                
                if(!(goButton && searchQuery))
                    return;

                goButton.onclick = submitSearch;
                searchQuery.onkeyup = submitSearch;
                searchQuery.oninput = getSuggestions;

                clearInterval(interval);
            }

            var interval = setInterval(function(){ bindElements() }, 1000);

            switchOverlay(false);
        });

        router.routeProvider.register('/:category/details/:id', 'shell', function (urlParams) {
            switchOverlay(true);

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
                    switchOverlay(false);
                });

                var header = document.getElementById('header');
                header.innerHTML = model[categories[urlParams.category]];  
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

                    switchOverlay(false);
                });
            });
        });

        router.routeProvider.register('/comics/list/:filter/:query', 'shell', function (urlParams) {
            switchOverlay(true);

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
                    switchOverlay(false);
                });

                var header = document.getElementById('header');
                header.innerHTML = 'List of ' + urlParams.filter + ' --- ' + urlParams.query.replace(/_/g, " ");               
            });
        });

        router.routeHandler.router();
    }
);