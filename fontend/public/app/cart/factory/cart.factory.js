angular.module('shopnxApp').factory('Cart', function($location, $rootScope) {
    var myCart = new ShoppingCart('10k', $rootScope);
    return myCart;
}).factory('Checkount', ['$resource', function($resource) {
    return {
        checkountOne: $resource('/api/checkount/one/:product_id/:qty', null, {
            'checkountOne': {
                method: 'PUT'
            }
        }),
        getCountUserBuyInSession: $resource('/api/checkount/getCountUserBuyInSession/:product_id', null, {
            'getCountUserBuyInSession': {
                method: 'PUT'
            }
        }),
        findProductBy_ID: $resource('/api/checkount/findProductBy_ID/:_id', null, {
            'findProductBy_ID': {
                method: 'PUT'
            }
        }),
        checkountAllCart: $resource('/api/checkount/checkountAllCart', null, {
            'checkountAllCart': {
                method: 'POST'
            }
        })
    }
}])