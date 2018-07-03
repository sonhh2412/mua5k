'use strict';
angular.module('shopnxApp').factory('Banner', ['$resource', function($resource) {
    return {
        addBanner: $resource('/api/banner/addBanner', null, {
            'addBanner': {
                method: 'POST'
            }
        }),
        editBanner: $resource('/api/banner/editBanner', null, {
            'editBanner': {
                method: 'POST'
            }
        }),
        removeBanner: $resource('/api/banner/removeBanner/:id', null, {
            'removeBanner': {
                method: 'PUT'
            }
        }),
        getListSliceBanners: $resource('/api/banner/getListSliceBanners', null, {
            'getListSliceBanners': {
                method: 'PUT'
            }
        }),
        getListSliceBannersActive: $resource('/api/banner/getListSliceBannersActive', null, {
            'getListSliceBannersActive': {
                method: 'PUT'
            }
        }),
        getListBannerRights: $resource('/api/banner/getListBannerRights', null, {
            'getListBannerRights': {
                method: 'PUT'
            }
        }),
        getListBannerRightsActive: $resource('/api/banner/getListBannerRightsActive', null, {
            'getListBannerRightsActive': {
                method: 'PUT'
            }
        }),
        getListBannerItems: $resource('/api/banner/getListBannerItems', null, {
            'getListBannerItems': {
                method: 'PUT'
            }
        }),
        getListBannerItemsActive: $resource('/api/banner/getListBannerItemsActive', null, {
            'getListBannerItemsActive': {
                method: 'PUT'
            }
        }),
        getBannerbySlug: $resource('/api/banner/getBannerbySlug/:slug', null, {
            'getBannerbySlug': {
                method: 'PUT'
            }
        }),
        getListBannerLimited: $resource('/api/banner/getListBannerLimited', null, {
            'getListBannerLimited': {
                method: 'PUT'
            }
        }),
        getListBannerLimitedActive: $resource('/api/banner/getListBannerLimitedActive', null, {
            'getListBannerLimitedActive': {
                method: 'PUT'
            }
        }),
        getListGuideBanners: $resource('/api/banner/getListGuideBanners', null, {
            'getListBannerGuide': {
                method: 'PUT'
            }
        }),
        getListGuideBannersActive: $resource('/api/banner/getListGuideBannersActive', null, {
            'getListGuideBannersActive': {
                method: 'PUT'
            }
        }),
        getListGuideMobileBanners: $resource('/api/banner/getListGuideMobileBanners', null, {
            'getListGuideMobileBanners': {
                method: 'PUT'
            }
        }),
        getListGuideMobileBannersActive: $resource('/api/banner/getListGuideMobileBannersActive', null, {
            'getListGuideMobileBannersActive': {
                method: 'PUT'
            }
        }),
    }
}])