'use strict'; angular.module('shopnxApp') .controller('ManageShareCtrl', function($scope, $rootScope, $location, Auth, CustomerSharing, $compile, $mdDialog, Product){$rootScope.isPageProduct = false; $rootScope.isHomePage = false; $rootScope.parmas = {home : false, waiting_result : false, restricted_area : false, customer_share : false, forum : false, help : false, }; Auth.isLoggedInAsync(function(cb){if(!cb){$location.path('/dang-nhap.html'); } else {$rootScope.isAdmin = Auth.isAdmin(); if (!$rootScope.isAdmin) {$location.path('/dang-nhap.html'); } else {$scope.urlSharingList = '/api/sharing/get-list-sharing'; $scope.sharing = {}; $scope.list_products = []; $scope.list_sessions = []; $scope.list_customer = []; $scope.productSelect = {}; $scope.sessionSelect = {}; $scope.customerSelect = {}; $scope.list_lotteries = {}; $scope.isErrorExits = false; var getListLotteries = function() {CustomerSharing.getListLotteries.query() .$promise.then(function(result){$scope.list_products = result; }) }; var getListSessionLotteriesByProduct = function(product_id) {CustomerSharing.getListSessionLotteriesByProduct.query({ id:product_id }) .$promise.then(function(session) {$scope.list_sessions = session; }); }; var removeElementImage = function() {var elementInputImage = angular.element(document.querySelectorAll('.input-image-sharing')); var k = 3; while (k < elementInputImage.length) {elementInputImage.eq(elementInputImage.length - 1).remove(); $scope.sharing.images.pop(elementInputImage.length - 1); elementInputImage = angular.element(document.querySelectorAll('.input-image-sharing')); $compile(elementInputImage)($scope); } }; var getCustomerSharingbySession = function(product_id, session) {Product.getCustomerSharingbySession.query({id:product_id, session_id:session.session_id, session_number:session.number}) .$promise.then(function(customers){$scope.list_customer = customers; }) .catch(function(err){$scope.list_customer = []; }); }; getListLotteries(); $scope.AddElementImage = function(){var elementInputImage = angular.element(document.querySelectorAll('.input-image-sharing')); var indexNewInputImage = elementInputImage.length + 1; $scope.sharing.images[indexNewInputImage - 1] = ''; var template = '<div class="form-group input-image-sharing image-sharing-custom" ng-class="{'+"'has-error'"+' : rc.frmAddSharing.needsAttention(frmAddSharing.image'+indexNewInputImage+') }"><label>Link hình chia sẻ '+indexNewInputImage+'</label><input type="text" class="form-control" placeholder="Nhập hình ảnh" name="image'+indexNewInputImage+'" ng-model="sharing.images['+(indexNewInputImage - 1)+']" required autocomplete="off"/><span class="note-input-float">*</span><a ng-click="removeOneImageElement($event)" class="m-l-10 clear-cdn-image">Clear image</a><div><span class="red" ng-show="rc.frmAddSharing.needsAttention(frmAddSharing.image'+indexNewInputImage+')">Vui lòng nhập hình ảnh</span></div></div>'; var elm = angular.element(template); elm.insertBefore(".add-element-image"); $compile(elm)($scope); }; $scope.removeOneImageElement = function($event) {var element = $event.target || $event.srcElement; var parent = $(element).parent(); var elementInputImage = angular.element(document.querySelectorAll('.input-image-sharing')); var k = 3; while (k < elementInputImage.length) {var elm_will_remove = elementInputImage.eq(k); if (elm_will_remove[0].outerHTML == parent[0].outerHTML) {$scope.sharing.images.splice(k, 1); parent.remove(); elementInputImage = angular.element(document.querySelectorAll('.input-image-sharing')); for(var i = k; i < elementInputImage.length; i++) {var template = '<div class="form-group input-image-sharing image-sharing-custom" ng-class="{'+"'has-error'"+' : rc.frmAddSharing.needsAttention(frmAddSharing.image'+(i+1)+') }"><label>Link hình chia sẻ '+(i+1)+'</label><input type="text" class="form-control" placeholder="Nhập hình ảnh" name="image'+(i+1)+'" ng-model="sharing.images['+i+']" required autocomplete="off"/><span class="note-input-float">*</span><a ng-click="removeOneImageElement($event)" class="m-l-10 clear-cdn-image">Clear image</a><div><span class="red" ng-show="rc.frmAddSharing.needsAttention(frmAddSharing.image'+(i+1)+')">Vui lòng nhập hình ảnh</span></div></div>'; var elm_rep = angular.element(template); var elm_tmp = elementInputImage.eq(i); elm_tmp.replaceWith($compile(elm_rep)($scope)); } break; } k += 1; } }; $scope.ViewFormOpen = function(){$scope.sharing.name = ''; $scope.sharing.content = ''; $scope.sharing.image_main = ''; $scope.sharing.images = ['', '', '']; $scope.sharing.user = {}; $scope.sharing.session = {}; $scope.sharing.product = {}; $scope.productSelect = {}; $scope.sessionSelect = {}; $scope.customerSelect = {}; $scope.isAddSharing = true; }; $scope.CloseFormOpen = function(){removeElementImage(); $scope.isAddSharing = false; $scope.sharing.name = ''; $scope.sharing.content = ''; $scope.sharing.image_main = ''; $scope.sharing.images = ['', '', '']; $scope.sharing.user = {}; $scope.sharing.session = {}; $scope.sharing.product = {}; $scope.user = {}; $scope.productSelect = {}; $scope.sessionSelect = {}; $scope.customerSelect = {}; $scope.isErrorExits = false; }; $scope.changeProduct = function(product){$scope.isErrorExits = false; $scope.sharing.product = { name: product.name, id: product.id, slug: product.slug}; getListSessionLotteriesByProduct(product.id); $scope.sessionSelect = {}; $scope.customerSelect = {}; $scope.user = {}; }; $scope.changeSession = function(product, session){$scope.isErrorExits = false; $scope.sharing.session = {session_number : session.session_number, session_id : session.session_id }; $scope.sharing.user = {_id : session.user_win._id, number_code : 0, winner_code : session.user_win.winner_code, time_result : session.user_win.time_result, }; Auth.getUserbyId(session.user_win._id).then(function(user){$scope.user = user; if ($scope.user.fullname === "") $scope.user.fullname = user.email; }); CustomerSharing.getNumberCodeUserBuy.query({product_id: product.id, session_id: session.session_id, user_id: session.user_win._id }).$promise.then(function(result){$scope.sharing.user.number_code = result[0].count; }); }; $scope.submit = function(){CustomerSharing.addSharing.save($scope.sharing) .$promise.then(function(result){removeElementImage(); $scope.sharing.name = ''; $scope.sharing.content = ''; $scope.sharing.image_main = ''; $scope.sharing.images = ['', '', '']; $scope.sharing.user = {}; $scope.user = {}; $scope.sharing.session = {}; $scope.sharing.product = {}; $scope.productSelect = {}; $scope.sessionSelect = {}; $scope.customerSelect = {}; $scope.isAddSharing = false; $scope.isErrorExits = false; $scope.reloadPage = true; }).catch(function(err){if (typeof err.data != 'undefined') {if (err.data[0] == 1) $scope.isErrorExits = true; } }); }; $scope.RemoveSharing = function(id){var confirm = $mdDialog.confirm() .title('Bạn có muốn xóa bài viết chia sẻ này?') .targetEvent(id) .ok('Xóa') .cancel('Hủy'); $mdDialog.show(confirm).then(function() {CustomerSharing.removeSharing.remove({id: id }) .$promise.then(function(result){removeElementImage(); if ($scope.list_sharing.results.length === 1) {$scope.goto($scope.page > 0 ? $scope.page - 1 : 0); } $scope.reloadPage = true; }) .catch(function(err){}); }, function() {}); }; } } }); }) .controller('ManageShareBySlugCtrl', function($scope, $rootScope, $location, Auth, CustomerSharing, $compile, $mdDialog, Product, $stateParams){$rootScope.isPageProduct = false; $rootScope.isHomePage = false; $rootScope.parmas = {home : false, waiting_result : false, restricted_area : false, customer_share : false, forum : false, help : false, }; Auth.isLoggedInAsync(function(cb){if(!cb){$location.path('/dang-nhap.html'); } else {$rootScope.isAdmin = Auth.isAdmin(); if (!$rootScope.isAdmin) {$location.path('/dang-nhap.html'); } else {$scope.isEdit = false; $scope.sharing = {}; $scope.productSelect = {}; $scope.sessionSelect = {}; $scope.customerSelect = {}; $scope.list_products = {}; $scope.list_sessions = {}; $scope.list_customer = {}; $scope.isErrorExits = false; $scope.AddElementImage = function(){var elementInputImage = angular.element(document.querySelectorAll('.input-image-sharing')); var indexNewInputImage = elementInputImage.length + 1; var template = '<div class="form-group input-image-sharing image-sharing-custom" ng-class="{'+"'has-error'"+' : rc.frmAddSharing.needsAttention(frmAddSharing.image'+indexNewInputImage+') }"><label>Link hình chia sẻ '+indexNewInputImage+'</label><input type="text" class="form-control" placeholder="Nhập hình ảnh" name="image'+indexNewInputImage+'" ng-model="sharing.images['+(indexNewInputImage - 1)+']" required autocomplete="off" ng-disabled="!isEdit"/><span class="note-input-float">*</span><a ng-click="removeOneImageElement($event)" class="m-l-10 clear-cdn-image" ng-show="isEdit">Clear image</a><div><span class="red" ng-show="rc.frmAddSharing.needsAttention(frmAddSharing.image'+indexNewInputImage+')">Vui lòng nhập hình ảnh</span></div></div>'; var elm = angular.element(template); elm.insertBefore(".add-element-image"); $compile(elm)($scope); }; var runAddElmImage = function(len_img){if (len_img > 3) {for (var i=0; i < len_img - 3; i++) $scope.AddElementImage(); } }; var getListSessionLotteriesByProduct = function(product_id) {CustomerSharing.getListSessionLotteriesByProduct.query({ id:product_id }) .$promise.then(function(session) {$scope.list_sessions = session; $scope.list_sessions.forEach(function(item, index){if (Object.keys($scope.sharing.session).length != 0) {if (item.session_id == $scope.sharing.session[0].session_id && item.session_number == $scope.sharing.session[0].session_number) {$scope.sessionSelect = $scope.list_sessions[index]; Auth.getUserbyId($scope.sharing.user[0]._id).then(function(user){$scope.user = user; if ($scope.user.fullname === "") $scope.user.fullname = user.email; }); return; } } }); }); }; var getSharingContent = function() {CustomerSharing.getSharingContentBySlug.get({slug: $stateParams.slug }) .$promise.then(function(result){$scope.sharing = result; runAddElmImage(result.images.length); $scope.list_products.forEach(function(item, index){if (item._id.id == $scope.sharing.product[0].id) {$scope.productSelect = $scope.list_products[index]._id; getListSessionLotteriesByProduct($scope.sharing.product[0].id); return; } }); }); }; var getListLotteries = function() {CustomerSharing.getListLotteries.query() .$promise.then(function(result){$scope.list_products = result; getSharingContent(); }) }; getListLotteries(); $scope.removeOneImageElement = function($event) {var element = $event.target || $event.srcElement; var parent = $(element).parent(); var elementInputImage = angular.element(document.querySelectorAll('.input-image-sharing')); var k = 3; while (k < elementInputImage.length) {var elm_will_remove = elementInputImage.eq(k); if (elm_will_remove[0].outerHTML == parent[0].outerHTML) {$scope.sharing.images.splice(k, 1); parent.remove(); elementInputImage = angular.element(document.querySelectorAll('.input-image-sharing')); for(var i = k; i < elementInputImage.length; i++) {var template = '<div class="form-group input-image-sharing image-sharing-custom" ng-class="{'+"'has-error'"+' : rc.frmAddSharing.needsAttention(frmAddSharing.image'+(i+1)+') }"><label>Link hình chia sẻ '+(i+1)+'</label><input type="text" class="form-control" placeholder="Nhập hình ảnh" name="image'+(i+1)+'" ng-model="sharing.images['+i+']" required autocomplete="off"/><span class="note-input-float">*</span><a ng-click="removeOneImageElement($event)" class="m-l-10 clear-cdn-image">Clear image</a><div><span class="red" ng-show="rc.frmAddSharing.needsAttention(frmAddSharing.image'+(i+1)+')">Vui lòng nhập hình ảnh</span></div></div>'; var elm_rep = angular.element(template); var elm_tmp = elementInputImage.eq(i); elm_tmp.replaceWith($compile(elm_rep)($scope)); } break; } k += 1; }; }; var removeElementImage = function() {var elementInputImage = angular.element(document.querySelectorAll('.input-image-sharing')); var k = 3; while (k < elementInputImage.length) {elementInputImage.eq(elementInputImage.length - 1).remove(); $scope.sharing.images.pop(elementInputImage.length - 1); elementInputImage = angular.element(document.querySelectorAll('.input-image-sharing')); }; }; $scope.changeProduct = function(product, session){$scope.sharing.product = [{ name: product.name, id: product.id, slug: product.slug}]; $scope.isErrorExits = false; $scope.sessionSelect = {}; $scope.customerSelect = {}; $scope.sharing.session = {}; $scope.sharing.user = {}; $scope.user = {}; getListSessionLotteriesByProduct(product.id); }; $scope.changeSession = function(product, session){$scope.isErrorExits = false; $scope.sharing.session = [{session_number: session.session_number, session_id: session.session_id }]; $scope.sharing.user = [{_id : session.user_win._id, number_code : 0, winner_code : session.user_win.winner_code, time_result : session.user_win.time_result, }]; Auth.getUserbyId(session.user_win._id).then(function(user){$scope.user = user; if ($scope.user.fullname === "") $scope.user.fullname = user.email; }); CustomerSharing.getNumberCodeUserBuy.query({product_id: product.id, session_id: session.session_id, user_id: session.user_win._id }).$promise.then(function(result){$scope.sharing.user.number_code = result[0].count; }); }; $scope.EditSharing = function(){$scope.isEdit = true; }; $scope.submit = function(){CustomerSharing.editSharing.save($scope.sharing). $promise.then(function(result){$scope.isEdit = false; removeElementImage(); getSharingContent(); $scope.isErrorExits = false; }).catch(function(err){if (typeof err.data != 'undefined') {if (err.data[0] == 1) $scope.isErrorExits = true; } }); }; $scope.RemoveSharing = function(id){var confirm = $mdDialog.confirm() .title('Bạn có muốn xóa bài viết chia sẻ này?') .targetEvent(id) .ok('Xóa') .cancel('Hủy'); $mdDialog.show(confirm).then(function() {CustomerSharing.removeSharing.remove({id: id }) .$promise.then(function(result){$location.path('/quan-ly-khach-hang-chia-se.html'); }) .catch(function(err){}); }, function() {}); }; $scope.CloseFormOpen = function(){$scope.isEdit = false; removeElementImage(); getSharingContent(); $scope.isErrorExits = false; }; } } }); })