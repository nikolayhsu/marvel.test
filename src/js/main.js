require.config({
    paths: {
        'text': '/lib/js/text',
        'lib': '/lib/js',
        'js': '/src/js',
        'partials': '/partials',
        'templates': '/templates',
        'controller': '/src/js/controllers'
    }
});

require(
    [
        'js/router',
        'js/marvelConnector'
    ],
    function (router, marvelConnector) {
        // Listen on hash change
        window.addEventListener('hashchange', router.routeHandler.router);        

        // Define routes
        router.routeProvider.register('/404', '404', '404');
        router.routeProvider.register('/', 'home', 'home');
        router.routeProvider.register('/:category/details/:id', 'shell', 'details');
        router.routeProvider.register('/:filter/list/:query', 'shell', 'list');

        router.routeHandler.router();
});