'use strict';

define(['js/marvelConnector'], function () {
	var marvelConnector = (function() {
		var publicKey = "c3a3e24b521f879368293343d5f7cb6f";
		var privateKey = "ae4e4019955d0a0d36ed44c91e89d06c23290ce1";
		var marvelBaseUrl = "http://gateway.marvel.com/v1/public/";

		var getHash = function (ts) {
			return CryptoJS.MD5(ts + privateKey + publicKey);
		}

		var request = function (category, itemId, filter, options, successCallBack, errorCallBack) {
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

			query += category;

			if(itemId) {
				query += '/' + itemId;
			}

			if(filter) {
				query += '/' + filter;
			}

			query += '?ts=' + ts + '&apikey=' + publicKey + '&hash=' + hash;

			if(options && typeof options === 'object') {
				for(var x in options) {
					query += '&' + x + '=' + options[x];
				}
			}

			var xhr = new XMLHttpRequest();
			xhr.open('GET', query);
			xhr.onload = function() {
			    if (xhr.status === 200 && successCallBack) {
			       	successCallBack(JSON.parse(xhr.responseText).data);
			    }
			    else {
			        console.log(xhr.status);
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