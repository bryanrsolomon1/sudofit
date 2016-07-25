module.exports = {
    "development": {
            "env": "dev",
            "dist": "./dist.dev/",
            "distApp": "./dist.dev/app/",
            "distBower": "./dist.dev/bower_components/"
    },
    "production": {
            "env": "pro",
            "dist": "./dist.pro/",
            "distApp": "./dist.pro/app/",
            "distBower": "./dist.pro/bower_components/"
        }
};