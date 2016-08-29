// Based on http://joakim.beng.se/blog/posts/a-javascript-router-in-20-lines.html
'use strict';

define([], function () {
	var routeProvider = (function () {
		var routes = {};

		function getRoute(url) {
			var tempRoute = routes[url];
			var urlParams = [];
			var routeTokens = [];

			if(!tempRoute) {
				urlParams = url.split('/');

				for(var route in routes) {
					routeTokens = route.split('/');
					
					if(urlParams.length != routeTokens.length)
						continue;

					for(let [index, token] of routeTokens.entries()) {
						if(token[0] != ":" && urlParams[index] != token)
							break;

						if(index == routeTokens.length - 1)
							return routes[route];
					}
				}
			}

			if(!tempRoute) {
				return routes["/404"];
			}			

			return routes[url];
		}

		function registerRoute (path, templateId, controller) {
			routes[path] = {
				"templateId": templateId, 
				"controller": controller,
				"path": path
			};
		}

		return {
			"register": registerRoute,
			"getRoute": getRoute	
		};
	})();

	var routeHandler = (function () {
		var el = null;
		var currentUrlParams = {};

		function getTemplate(templateId) {
			var templateUrl = 'partials/' + templateId + '.html';
			return require(['text!' + templateUrl], function (template) {
	            return template;
	        });
		}

		function getUrlParameters(path, url) {
			var routeTokens = path.split('/');
			var urlTokens = url.split('/');
			var params = {};
			for(var i = 1; i < routeTokens.length; i++) {
				if(routeTokens[i].length > 0 && routeTokens[i][0] == ':') {
					params[routeTokens[i].replace(':', '')] = urlTokens[i];
				}
			}

			currentUrlParams = params;

			return params;
		}

		function getCurrentUrlParams() {
			return currentUrlParams;
		}

		function router () {
		    // Lazy load view element:
		    el = el || document.getElementById('view');
		    // Current route url (getting rid of '#' in hash as well):
		    var url = location.hash.slice(1) || '/';
		    // Get route by url:
		    var route = routeProvider.getRoute(url);

		    var urlParams = getUrlParameters(route.path, url);
		    // Do we have both a view and a route?

		    if (el && route.controller) {
		        // Render route template with John Resig's template engine:
		        var templateUrl = 'partials/' + route.templateId + '.html';
		        require.undef('controller/' + route.controller + 'Controller');
		        require(['text!' + templateUrl, 'controller/' + route.controller + 'Controller'], function (template, controller) {
		        	el.innerHTML = Mustache.render(template, controller);
		    	});
		    }
		}

		return {
			"router": router,
			"getCurrentUrlParams": getCurrentUrlParams
		};
	})();

	return {
		routeProvider:routeProvider,
		routeHandler:routeHandler
	};
});