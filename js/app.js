(function(){
"use strict";

angular.module('ionicCost', ['ngAnimate', 'ngRoute', 'duScroll', 'angular-google-analytics', 'pascalprecht.translate'])
.run(function(Analytics){
    Analytics.set('anonymizeIp', true);
})


.factory('customLoader', function ($http, $q) {
    // return loaderFn
    return function (options) {
        var deferred = $q.defer();
        // do something with $http, $q and key to load localization files
        console.log(options.key)
        var data = {};
        d3.csv("config/translations.csv", function(rows){
            console.log(1, rows)
            _.each(rows, function(r){
                console.log(r, options.key)
                data[r['string_code']] = r[options.key]
            });
            deferred.resolve(data);
            console.log(data)
        });
        
 
        // resolve with translation data
        
        return deferred.promise;
        // or reject with language key
        //return deferred.reject(options.key);
    };
})

.config(function(AnalyticsProvider, $translateProvider){
    AnalyticsProvider.setAccount('UA-44618885-7');
    AnalyticsProvider.trackPages(true);
    $translateProvider.useLoader('customLoader');
    $translateProvider.preferredLanguage('en');
})



})();