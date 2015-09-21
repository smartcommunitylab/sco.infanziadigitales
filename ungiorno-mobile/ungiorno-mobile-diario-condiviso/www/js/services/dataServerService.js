angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.dataServerService', [])

.factory('dataServerService', function ($http, $q) {
    var babyConfiguration = null; //static info
    var babyProfile = null;
    var assenza = null;
    var schoolProfile = null; //static info
    var dataServerService = {};
    var user = null;

    var retrieveUser = function () {
        var deferred = $q.defer();

        // temp
        if (user == null) {
            $http.get('data/teacher-profile.json').success(function (data) {
                deferred.resolve(data);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
            });
        } else {
            deferred.resolve(user);
        }
        return deferred.promise;
    };



    /**
     * Whether the user is logged
     */
    dataServerService.userIsLogged = function() {
        return (localStorage.user != null && localStorage.user != "null");
    }

    /**
     * return profile of the logged user, or null if not logged in
     */
    dataServerService.getUser = function () {
        if (dataServerService.userIsLogged()) {
            return JSON.parse(localStorage.user);
        }
        return null;
    };

    /**
     * Logout user
     */
    dataServerService.logout = function () {
        localStorage.user = null;
    }

    /**
     * Mock login
     */
    dataServerService.login = function (provider, cb, err) {
        retrieveUser().then(function(user) {
            localStorage.user = JSON.stringify(user);
            cb(localStorage.user);
        });
    }

    /**
     * Retrieve configuration of a specific child
     */
    dataServerService.getBabyConfiguration = function (babyId) {
        var deferred = $q.defer();

        /*temp*/
        if (babyConfiguration == null) {
            $http.get('data/bambino-configurazione.json').success(function (data) {
                babyConfiguration = data.data;
                deferred.resolve(babyConfiguration);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                //deferred.reject(err);
            });

            /*temp*/
        } else deferred.resolve(babyConfiguration);
        return deferred.promise;
    }


    /**
     * Retrieve profiles of the logged parent/teacher
     */
    dataServerService.getBabyProfiles = function () {
        var deferred = $q.defer();

        /*temp*/
        $http.get('data/bambino-profilo.json').success(function (data) {
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            //deferred.reject(err);
        })
        return deferred.promise;
        /*temp*/
    }

    dataServerService.save = function(post) {
        return dataServerService.getPostsByBabyId();
    }

    /**
     * Retrieve tags to be used
     */
    dataServerService.getTags = function () {
        var tags = null;
        var deferred = $q.defer();

        // temp
        if (tags == null) {
            $http.get('data/post-tags.json').success(function (data) {
                tags = data;
                deferred.resolve(tags);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
            });
        } else {
            deferred.resolve(tags);
        }
        return deferred.promise;
    };

    /**
     * Retrieve child posts
     */
    dataServerService.getPostsByBabyId = function (babyId, start, count) {
        var posts = null;
        var deferred = $q.defer();

        // temp
        if (posts == null) {
            $http.get('data/calendario-diario.json').success(function (data) {
                posts = data.data;
                deferred.resolve(posts);
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
            });
        } else {
            deferred.resolve(posts);
        }
        return deferred.promise;
    };

        /**
     * Retrieve child posts
     */
    dataServerService.getGalleryByBabyId = function (babyId, start, count) {
        var deferred = $q.defer();
        dataServerService.getPostsByBabyId(babyId, start, count).then(function(posts){
            var res = [];
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].pictures) {
                    for (var j = 0; j < posts[i].pictures.length; j++) {
                        res.push({url:posts[i].pictures[j].url, date: posts[i].date});
                    }
                }
            }
            deferred.resolve(res);
        });
        return deferred.promise;
    }


    return dataServerService;
})
