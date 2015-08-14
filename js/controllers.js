(function(){
"use strict";

angular.module('ionicCost')
.controller('AppCtrl', ['$scope', '$configurator',function ($scope, $configurator) {

    $scope.data = {};
    $scope.data.screens = { num: 3};
    $scope.data.languages = { num: 1};
    $scope.data.orientations = { portrait: 1, landscape:1};
    $scope.data.devices = {phone:1, tablet:1};

    $scope.data.controls = 'standard';
    $scope.data.quality = 'production';

    $scope.data.platforms = {ios:1, android:1 };
    $scope.featuresList = ['auth', 'data', 'api-integration', 'device', 'media', 'communication', 'geo', 'social',
            'graphics', 'deployment', 'services-integration', 'ecommerce'];

    $scope.toggleBottom = function(){
        if($scope.errors.length){
            $scope.bottomPanel =false;
            return;    
        }
        $scope.bottomPanel = !!!$scope.bottomPanel;
    }

    var setDefault = function(group, code, value){
        $scope.data[group] = $scope.data[group] || {};
        $scope.data[group][code] = value;
    }

    $configurator.getConfig()
    .then(function(options){
        $scope.featureOptions = options;
        updateEstimate();
    });

    $scope.estimate = { price : null};
    $scope.errors = [];

    var updateEstimate = function(){
        $scope.errors = [];
        if(!$scope.featureOptions){
            return;
        }

        if(!$scope.data.platforms.ios && !$scope.data.platforms.android){
            $scope.errors = ['Please select at least one platform!']; 
            return;
        }

        if(!$scope.data.devices.phone && !$scope.data.devices.tablet){
            $scope.errors = ['Please select at least one device type!']; 
            return;
        }

        if(!$scope.data.screens.num || parseInt($scope.data.screens.num) < 1){
            $scope.errors = ['Please add at least one screen!']; 
            return;
        }

        if(!$scope.data.languages.num || parseInt($scope.data.languages.num) < 1){
            $scope.errors = ['Please add at least one language!']; 
            return;
        }

        var estimate = { price : null};
        
        
        //scaffolding

        estimate.scaffolding = {
            nav :   $configurator.getFeatureCost('scaffolding', 'scaffolding.nav'),
            screens : $configurator.getFeatureCost('scaffolding','scaffolding.screens') * $scope.data.screens.num,
            
        }

        estimate.features = {};
        estimate.numFeatures = 0;

        estimate.scaffolding.total = estimate.scaffolding.nav + estimate.scaffolding.screens;
        estimate.scaffolding.totalCorrected = estimate.scaffolding.total * 1;

        var fts = $scope.featuresList;
        console.log("1000", $scope.data);
        var featuresTotal = 0;
        _.each(fts, function(fgroup){
            var t = 0;
            var d = $scope.data[fgroup];
            if(d){
                _.each(d, function(value, code){
                    var featureCost = $configurator.getFeatureCost(fgroup, code);
                    var cost = featureCost * parseInt(value);
                    if(parseInt(value)){
                        estimate.numFeatures += 1;
                    }
                    console.log("j", value, code, featureCost, cost);
                    if(cost){
                        t += cost;
                        featuresTotal += cost;
                    }
                })
                estimate.features[fgroup] = t;
            }
            //

        })
        estimate.featuresTotal =featuresTotal ;
        estimate.price = estimate.scaffolding.totalCorrected + estimate.featuresTotal;

        $scope.estimate = estimate;
        console.log(100, $scope.data)


    }

    $scope.$watch('data', function(){
        updateEstimate();
    }, true)
    




}]);


    
})();