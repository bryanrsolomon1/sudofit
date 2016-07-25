/**
 * Created by bryansolomon on 7/24/16.
 */
(function() {
    "use strict";

    function Theme($mdThemingProvider) {
        var black = $mdThemingProvider.extendPalette("blue", {
            "500": "000000"
        });

        var green = $mdThemingProvider.extendPalette("green", {
            "500": "6cc24a"
        });

        $mdThemingProvider.definePalette("black", black);
        $mdThemingProvider.definePalette("myGreen", green);

        $mdThemingProvider.theme("default")
            .primaryPalette("black", {
                "hue-1": "800"
            })
            .warnPalette("myGreen")
            .accentPalette("grey");
    }

    angular.module("sudofit").config(Theme);

})();