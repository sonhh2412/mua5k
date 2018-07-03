'use strict';
angular
    .module('shopnxApp')
    .factory('SystemParameters', [
        '$resource',
        function ($resource) {
            return {
                addParameter          : $resource('/api/system_parameter/add-parameter', null, {
                    'addParameter': {
                        method: 'POST'
                    }
                }),
                getListParameter      : $resource('/api/system_parameter/get-list-parameter', null, {
                    'getListParameter': {
                        method: 'PUT'
                    }
                }),
                getParameterByKey : $resource('/api/system_parameter/get-parameter/:key', null, {
                    'getParameterByKey': {
                        method: 'PUT'
                    }
                }),
                removeParamater       : $resource('/api/system_parameter/removeParamater/:id', null, {
                    'removeParamater': {
                        method: 'PUT'
                    }
                })
            }
        }
    ])