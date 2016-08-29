'use strict';

define(['js/marvelConnector', 'js/helper'], function (marvelConnector, helper) {
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

        window.location.hash = `/${filter}/list/${query}`;
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

    var changeFilter = function () {
        var filter = document.getElementById('filter').value;

        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("filter", filter);
            localStorage.setItem("filterTimestamp", Date.now());
        }
    }

    var bindElements = function () {
        var goButton = document.getElementById('go-button');
        var searchQuery = document.getElementById('search-query');
        var filterSelect = document.getElementById('filter');
        
        if(!(goButton && searchQuery))
            return;

        goButton.onclick = submitSearch;
        searchQuery.onkeyup = submitSearch;
        searchQuery.oninput = getSuggestions;
        filterSelect.onchange = changeFilter;

        if (typeof(Storage) !== "undefined") {
            var filter = localStorage.getItem("filter");
            var filterTimestamp = localStorage.getItem("filterTimestamp");
            
            if(filter && filterTimestamp) {
                var diff = Date.now() % filterTimestamp;

                if(diff < 300000) {
                    filterSelect.value = filter;
                }
            }
        }

        clearInterval(interval);
    }

    var interval = setInterval(function(){ bindElements() }, 1000);

    helper.switchOverlay(false);
});