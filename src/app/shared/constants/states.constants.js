/**
 * Created by bryansolomon on 7/24/16.
 */
(function() {
    "use strict";

    var root = "root";
    var main = root + ".main";

    angular.module("sudofit")
        .constant("MAIN_STATES", {
            ROOT: root,
            MAIN: main,
            HOME: main + ".home",
            SCIENCE: main + ".science",
            SHOP: main + ".shop",
            BLOG: main + ".blog"
        });

})();