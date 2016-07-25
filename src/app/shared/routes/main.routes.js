/**
 * Created by bryansolomon on 7/24/16.
 */
(function () {
    "use strict";

    function Routes($stateProvider, $urlRouterProvider, MAIN_STATES) {

        $urlRouterProvider.otherwise("/home");

        $stateProvider
            .state(MAIN_STATES.ROOT, {
                abstract: true,
                url: "/",
                templateUrl: "app/components/root/root.html",
                controller: "RootCtrl as Root"
            })
            .state(MAIN_STATES.MAIN, {
                abstract: true,
                views: {
                    navbar: {
                        templateUrl: "app/components/navbar/navbar.html",
                        controller: "NavbarCtrl as Navbar"
                    },
                    page: {
                        template: "<div ui-view id=\"body-wrapper\"></div>"
                    }
                }
            })
            .state(MAIN_STATES.HOME, {
                url: "home",
                templateUrl: "app/components/home/home.html",
                controller: "HomeCtrl as Home"
            })
            .state(MAIN_STATES.SCIENCE, {
                url: "science",
                templateUrl: "app/components/science/science.html",
                controller: "ScienceCtrl as Science"
            })
            .state(MAIN_STATES.SHOP, {
                url: "shop",
                templateUrl: "app/components/shop/shop.html",
                controller: "ShopCtrl as Shop"
            })
            .state(MAIN_STATES.BLOG, {
                url: "blog",
                templateUrl: "app/components/blog/blog.html",
                controller: "BlogCtrl as Blog"
            });
    }

    angular.module("sudofit").config(Routes);

})();