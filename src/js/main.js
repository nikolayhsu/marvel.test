require.config({
    paths: {
        'text': '/lib/js/text',
        'lib': '/lib/js',
        'js': '/src/js',
        'partials': '/partials'
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

        router.routeProvider.register('/', 'home', function (urlParams) {
            var bindGoButton = function () {
                var submitSearch = function () {
                    var query = document.getElementById('search-query').value;
                    var filter = document.getElementById('filter').value;

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

            options[urlParams["filter"]] = urlParams.query;

            marvelConnector.request('comics', null, null, options, function (data) {
                var obj = data.results;
                var tmp = '<table>{{#.}}<li>{{title}}</li>{{/.}}</table>';
                var panel = document.getElementById('main-panel');
                panel.innerHTML = Mustache.render(tmp, obj);
            });
        });

        router.routeHandler.router();
    }
);