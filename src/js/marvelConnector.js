'use strict';

define([], function () {
	var marvelConnector = (function() {
		var publicKey = "c3a3e24b521f879368293343d5f7cb6f";
		var privateKey = "ae4e4019955d0a0d36ed44c91e89d06c23290ce1";
		var marvelBaseUrl = "https://gateway.marvel.com/v1/public/";

		var getHash = function (ts) {
			return CryptoJS.MD5(ts + privateKey + publicKey);
		}

		var request = function (category, options, successCallBack, errorCallBack) {
			var ts = Date.now();
			var hash = getHash(ts);
			var query = marvelBaseUrl;
			var result = {
				"status": "OK",
				"message": ""
			};

			if(!(category && typeof category === 'string' && category != '')) {
				result.status = "NO_GOOD";
				result.message = "Parameter category is missing";

				if(errorCallBack && typeof errorCallBack === 'function') {
					errorCallBack(result);
				}

				return;
			}

			query += `${category}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;

			if(options && typeof options === 'object') {
				for(var key in options) {
					query += `&${key}=${options[key]}`;
				}
			}

			var xhr = new XMLHttpRequest();
			xhr.open('GET', query);
			xhr.onload = function() {
			    if (xhr.status === 200 && successCallBack) {
			       	successCallBack(JSON.parse(xhr.responseText).data);
			    }
			    else {
			        if (xhr.status === 404) {
			        	errorCallBack();
			        }
			    }
			};
			xhr.send();
		};

		return {
			"request": request
		};
	})();

	return marvelConnector;
});