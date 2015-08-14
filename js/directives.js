(function(){
"use strict";

angular.module('ionicCost')
.directive('selectedItem', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        require : 'ngModel',
        link: function (scope, iElement, iAttrs, ngModelController) {
            
            ngModelController.$render = function() {
                if(ngModelController.$viewValue){
                    iElement.addClass('cherry')
                } else{
                    iElement.removeClass('cherry');
                }
            };
            ngModelController.$render();

            function updateModel() {
                $timeout(function(){
                    var val = ngModelController.$viewValue ? 0 : 1;
                    ngModelController.$setViewValue(val);
                    ngModelController.$render();

                    if(iAttrs.reset && !val){
                        scope.$eval(iAttrs.reset);
                    }

                    if(iAttrs.set && val){
                        scope.$eval(iAttrs.set);
                    }
                });
            };

            iElement.on('click', function(){
                updateModel();
            });




        }
    };
}])

.directive('selectedItemValue', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        require : 'ngModel',
        link: function (scope, iElement, iAttrs, ngModelController) {

            var xvalue = iAttrs.value;            
            ngModelController.$render = function() {
                console.log()
                if(ngModelController.$viewValue == xvalue){
                    iElement.addClass('cherry')
                } else{
                    iElement.removeClass('cherry');
                }
            };
            ngModelController.$render();

            function updateModel() {
                $timeout(function(){
                    ngModelController.$setViewValue(xvalue);
                    ngModelController.$render();
                });
            };

            iElement.on('click', function(nv){
                updateModel();
            })


        }
    };
}])

.directive('optionInput', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        replace : true,
        templateUrl : 'templates/option.html',
        link: function (scope, iElement, iAttrs) {


        }
    };
}])

    
})();