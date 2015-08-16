(function(){
"use strict";


angular.module('ionicCost').
factory('$configurator', ['$q', function ($q) {
    
    var svc = {};
    svc.getConfig = function(){
        var deferred = $q.defer();
        d3.csv("config/features.csv", function(rows){
            svc.groups = _.groupBy(rows, 'category');
            d3.csv("config/multipliers.csv", function(multipliers){

                svc.multipliers = multipliers;
                deferred.resolve(svc.groups);
            });

            
        })
        return deferred.promise;
    }

    svc.getFeatureCost = function(group, code){
        if(!svc.groups){
            return null;
        }
        if(!svc.groups[group]){
            return null;
        }
        var g = svc.groups[group];
        var x = _.findWhere(g, {code:code});
        if(!x){
            return null;
        }
        return parseInt(x.cost);
    }

    svc.getMultiplier = function(code){
        if(!svc.multipliers){
            return null;
        }
        //console.log(2, svc.multipliers) 
         
        var x = _.findWhere(svc.multipliers, {code:code});
        if(!x){
            return null;
        }
        return parseFloat(x.value.replace(",", "."));
    }
    return svc;
}])


    
})();