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
            // 404 Page
            switchOverlay(false);
        });

        router.routeProvider.register('/', 'home', function (urlParams) {
            var submitSearch = function (event) {
                if(!event)
                    return;

                if(event.type == "keyup" && event.keyCode != 13)
                    return;

                var query = document.getElementById('search-query').value;
                var filter = document.getElementById('filter').value;

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

            var bindElements = function () {
                var goButton = document.getElementById('go-button');
                var searchQuery = document.getElementById('search-query');
                
                if(!(goButton && searchQuery))
                    return;

                goButton.onclick = submitSearch;
                searchQuery.onkeyup = submitSearch;

                clearInterval(interval);
            }

            var interval = setInterval(function(){ bindElements() }, 1000);

            switchOverlay(false);
        });

        router.routeProvider.register('/comics/list/:filter/:query', 'comics', function (urlParams) {
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

            options[filters[urlParams.filter]] = urlParams.query.replace(/_/g, " ");

            marvelConnector.request(urlParams.filter, options, function (data) {
                var model;

                if(urlParams.filter == "comics") {
                    model = data.results;

                    for(var x in model) {
                        model[x].onSaleDate = new Date(model[x].dates[0].date).toAusDate();
                    }
                }

                if(urlParams.filter == "characters") {
                    model = data.results[0];

                    if(model) {
                        for (let [index, item] of model.comics.items.entries()) {
                            item.index = index + 1;    
                        }
                    }
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
                header.innerHTML = 'List of Comics by ' + urlParams.filter + ' --- ' + urlParams.query.replace(/_/g, " ");               
            });
        });

        router.routeHandler.router();
    }
);