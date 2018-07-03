'use strict';
angular
.module('shopnxApp')
.factory('SystemParameter', function SystemParameter(SystemParameters, $q) {
    return {
        getParameterByKey: function(data) {
            var deferred = $q.defer();
            SystemParameters.getParameterByKey.get(
                    data
                , function (result) {
                    deferred.resolve(result);
                }, function (err) {
                    deferred.reject(err);
                })
            return deferred.promise;
        }
    }
});