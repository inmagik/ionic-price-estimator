(function(){
"use strict";

angular.module('ionicCost')
.controller('AppCtrl', ['$scope', '$location' ,'$configurator', '$document', '$timeout', '$http', 'Analytics',
    function ($scope, $location,$configurator, $document,$timeout, $http, Analytics) {

    //Analytics.trackPage('/');

    $scope.data = {};
    $scope.ui = { link:null };
    $scope.data.screens = { num: 0 };
    $scope.data.languages = { num: 1 };
    $scope.data.orientations = { portrait: 1, landscape: 0};
    $scope.data.devices = {phone:1, tablet:0};

    $scope.data.controls = 'standard';
    $scope.data.quality = 'production';

    $scope.data.graphics = { 'graphics.splash': 1, 'graphics.appicon' : 1 };
    $scope.data.deployment = { 'deployment.store':1 };

    $scope.data.platforms = {ios:0, android:0 };
    $scope.featuresList = ['auth', 'data', 'api-integration', 'device', 'media', 'communication', 'geo', 'social',
            'graphics', 'deployment', 'services-integration', 'ecommerce'];

    //#TODO:move to service
    var notifyError = function(msg){
      var bigbox = humane.create({baseCls: 'humane-flatty', timeout:0, clickToClose:true})
      bigbox.error = bigbox.spawn({addnCls: 'humane-flatty-error'})
      bigbox.error(msg);
    };
    var notifySuccess = function(msg){
      var bigbox = humane.create({baseCls: 'humane-flatty', timeout:2000, clickToClose:false})
      bigbox.success = bigbox.spawn({addnCls: 'humane-flatty-success'})
      bigbox.success(msg);
    };

    $scope.waitingServer = false;
    
    //TODO: MOVE TO SERVICE WITH RESTANGULAR
    //var baseApi = 'http://localhost:8000/';
    var baseApi = 'http://estimates.inmagik.com/';
    $scope.requestPermalink = function(){
        // create a new tracking event with optional value
        Analytics.trackEvent('estimate', 'requested-permalink');

        $scope.waitingServer=true;
        $http.post(baseApi + 'estimates/new/', { 
            project : 'ionic', email:$scope.ui.email, 
            config : $scope.data, estimate:$scope.estimate, 
            estimated_cost:$scope.estimate.price
        })
        .then(function(resp){
            //log success
            notifySuccess('Permalink sent!');
            $scope.ui.link = resp.data.link;
        })
        .catch(function(err){
            notifyError("Error sending permalink. Sorry, try later");
            $scope.ui.link = null;
        })
        .finally(function(){
            $scope.waitingServer=false;
        });
    };

    $scope.getPermalinkData = function(link){
        $scope.waitingServer=true;
        $http.get(baseApi + 'estimates/get/'+link+"/")
        .then(function(resp){
            $scope.data = resp.data.config;
            $scope.ui.link = resp.data.link_url;
            //log success
            notifySuccess("Data loaded from permalink :)");
            Analytics.trackEvent('estimate', 'load-permalink', link);
        })
        .catch(function(err){
            //log error
            notifyError("Sorry, cannot load data from given permalink!");
            Analytics.trackEvent('estimate', 'load-permalink-error', link);
        })
        .finally(function(){
            $scope.waitingServer=false;
        });
    };

    $scope.toggleBottom = function(){
        if($scope.errors.length){
            $scope.bottomPanel =false;
            return;    
        }
        $scope.bottomPanel = !!!$scope.bottomPanel;
    };

    var setDefault = function(group, code, value){
        $scope.data[group] = $scope.data[group] || {};
        $scope.data[group][code] = value;
    };

    $configurator.getConfig()
    .then(function(options){
        $scope.featureOptions = options;
        updateEstimate();
    });

    $scope.estimate = { price : null};
    $scope.errors = [];
    $scope.errorsFields = {};

    var updateEstimate = function(){
        $scope.errors = [];
        $scope.errorsFields = {};
        if(!$scope.featureOptions){
            return;
        }
        if(!$scope.data.platforms.ios && !$scope.data.platforms.android){
            $scope.errors.push('platforms')
            $scope.errorsFields['platforms'] = 'Please select at least one platform';
        }
        if(!$scope.data.devices.phone && !$scope.data.devices.tablet){
            $scope.errors.push('devices');
            $scope.errorsFields['devices'] = 'Please select at least one device type';
        }
        if(!$scope.data.orientations.portrait && !$scope.data.orientations.landscape){
            $scope.errors.push('orientations');
            $scope.errorsFields['orientations'] = 'Please select at least one orientation';
        }
        if(!$scope.data.screens.num || parseInt($scope.data.screens.num) < 1){
            $scope.errors.push('screens');
            $scope.errorsFields['screens'] = 'Please add at least one screen';
        }

        if(!$scope.data.languages.num || parseInt($scope.data.languages.num) < 1){
            $scope.errors.push('languages');
            $scope.errorsFields['languages'] = 'Please add at least one language';
        }
        if(_.keys($scope.errorsFields).length){
            return;
        }

        var estimate = { price : null};
        //scaffolding
        estimate.scaffolding = {
            nav :   $configurator.getFeatureCost('scaffolding', 'scaffolding.navbase') + $configurator.getFeatureCost('scaffolding', 'scaffolding.navperscreen') * $scope.data.screens.num,
            screens : $configurator.getFeatureCost('scaffolding','scaffolding.screens') * $scope.data.screens.num
        };

        estimate.features = {};
        estimate.numFeatures = 0;
        estimate.multipliers = {
            screen : 1,
            overall : 1
        };

        estimate.multipliers.quality = $configurator.getMultiplier("quality."+$scope.data.quality);
        
        var dd = $configurator.getMultiplier("device.phone") * $scope.data.devices.phone + $configurator.getMultiplier("device.tablet") * $scope.data.devices.tablet;
        estimate.multipliers.devices = Math.max(dd -1, 1);

        var or = $scope.data.orientations.landscape + $scope.data.orientations.portrait;
        if(or==1){
            estimate.multipliers.orientations = $configurator.getMultiplier("orientation.one") 
        } 
        if(or ==2){
          estimate.multipliers.orientations = $configurator.getMultiplier("orientation.two")   
        }
        
        estimate.multipliers.languages = Math.max(($scope.data.languages.num - 1) * $configurator.getMultiplier("languages.num"), 1);
        estimate.multipliers.controls = $configurator.getMultiplier("controls."+$scope.data.controls);

        var numPlatforms = $scope.data.platforms.ios + $scope.data.platforms.android;
        estimate.multipliers.platforms = Math.max((numPlatforms - 1) * $configurator.getMultiplier("platforms.num"), 1);

        estimate.multipliers.screen = estimate.multipliers.devices * estimate.multipliers.orientations * estimate.multipliers.controls;
        estimate.multipliers.overall = estimate.multipliers.quality * estimate.multipliers.languages * estimate.multipliers.platforms;

        
        estimate.scaffolding.total = estimate.scaffolding.nav + estimate.scaffolding.screens;
        

        var fts = $scope.featuresList;
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
                    if(cost){
                        t += cost;
                        featuresTotal += cost;
                    }
                })
                estimate.features[fgroup] = t;
            }

        })
        
        estimate.featuresTotal =featuresTotal;
        estimate.scaffolding.totalCorrected = estimate.scaffolding.total * estimate.multipliers.screen;
        estimate.basePrice = estimate.scaffolding.totalCorrected + estimate.featuresTotal;
        
        estimate.price = parseInt(estimate.basePrice * estimate.multipliers.overall);

        $scope.estimate = estimate;
    };

    $scope.$watch('data', function(nv, ov){
        if(angular.equals(nv, ov)){
            return;
        }
        updateEstimate();
        $scope.ui.link = null;
    }, true);

    var updateTopBar = function() {
      $timeout(function(){
          if($document.scrollTop() > 40){
            $scope.upperBar = true;
        } else {
            $scope.upperBar = false;
        }
      });
    };

    window.onscroll = updateTopBar;
    $document.on('scroll touchmove', updateTopBar);

    var s = $location.search();
    if(s.code){
        $scope.getPermalinkData(s.code);
    };  

}]);


    
})();