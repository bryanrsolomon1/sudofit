/**
 * Created by bryansolomon on 7/24/16.
 */
(function () {
    "use strict";

    function NavbarCtrl(MAIN_STATES) {

        var self = this;

        self.menuItems = menuItems();
        self.selectedItem = self.menuItems[0];

        self.selectItem = selectItem;

        function selectItem(item) {
            self.selectedItem = item;
        }

        function menuItems() {
            return [
                {
                    name: "home",
                    sref: MAIN_STATES.HOME
                },
                {
                    name: "science",
                    sref: MAIN_STATES.SCIENCE
                },
                {
                    name: "shop",
                    sref: MAIN_STATES.SHOP
                },
                {
                    name: "blog",
                    sref: MAIN_STATES.BLOG
                }
            ];
        }
    }

    angular.module("sudofit")
        .controller("NavbarCtrl", NavbarCtrl);

})();