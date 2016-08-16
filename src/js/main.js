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
        // Listen on page load:
        // window.addEventListener('load', router.routeHandler.router);
        router.routeProvider.register('/404', '404', function (urlParams) {
            // NO ACTION
        });

        router.routeProvider.register('/', 'home', function (urlParams) {
            var bindGoButton = function () {
                var submitSearch = function () {
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

                    window.location.hash = '/comics/list/' + filter + '/' + query;
                };
                var goButton = document.getElementById('go-button');
                
                if(!goButton)
                    return;

                goButton.addEventListener("click", submitSearch, false);

                clearInterval(myVar);
            }

            var myVar = setInterval(function(){ bindGoButton() }, 1000);
        });

        router.routeProvider.register('/comics/list/:filter/:query', 'comics', function (urlParams) {
            var options = {};

            switch(urlParams["filter"]) {
                case "comics":
                    options["title"] = urlParams.query.replace(/_/g, " ");
                    break;
                case "characters":
                    options["name"] = urlParams.query.replace(/_/g, " ");
                    break;
                case "series":
                    options["title"] = urlParams.query.replace(/_/g, " ");
            }

            marvelConnector.request(urlParams["filter"], null, null, options, function (data) {
                var obj;

                if(urlParams["filter"] == "comics") {
                    obj = data.results;

                    for(var x in obj) {
                        obj[x].onSaleDate = new Date(obj[x].dates[0].date).toAusDate();
                    }
                }

                if(urlParams["filter"] == "characters") {
                    obj = data.results[0];

                    for(var i = 0; i < obj.comics.items.length; i++) {
                        obj.comics.items[i].index = i + 1;
                    }
                }

                if(urlParams["filter"] == "series") {
                    obj = data.results;
                    for(var i = 0; i < obj.length; i++) {
                        for(var j = 0; j < obj[i].comics.items.length; j++) {
                            obj[i].comics.items[j].index = j + 1;
                        }
                    }
                }

                var templateName = urlParams["filter"] + "List.html";

                require(['text!templates/' + templateName], function (template) {
                    var panel = document.getElementById('main-panel');
                    panel.innerHTML = Mustache.render(template, obj);
                });

                var header = document.getElementById('header');
                var headerObj = { header: 'List of Comics by ' + urlParams["filter"] + ' --- ' + urlParams.query.replace(/_/g, " ") };
                var tmp = '{{ header }}';
                header.innerHTML = Mustache.render(tmp, headerObj);                
            });
        });

        router.routeHandler.router();
    }
);