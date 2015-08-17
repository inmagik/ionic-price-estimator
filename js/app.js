(function(){
"use strict";

angular.module('ionicCost', ['ngAnimate', 'duScroll', 'angular-google-analytics'])
.run(function(Analytics){
    Analytics.set('anonymizeIp', true);
})

.config(function(AnalyticsProvider){
    AnalyticsProvider.setAccount('UA-44618885-7');
     AnalyticsProvider.trackPages(true);
});



})();