angular.module('it.smartcommunitylab.infanziadigitales.diario.diariocondiviso.services.dataServerService', [])

.factory('dataServerService', function ($http, $q, Config) {
    var babyConfiguration = null; //static info
    var babyProfile = null;
    var assenza = null;
    var schoolProfile = null; //static info
    var dataServerService = {};
    var user = null;
    var tags = null;
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

    /* Check if current profile is a teacher or not */
    dataServerService.isATeacher = function () {
        return localStorage.currentProfile === "teacher";
    };


    /**
     * Whether the user is logged
     */
    dataServerService.userIsLogged = function () {
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
     * Mock login
     */
    dataServerService.login = function (provider, cb, err) {
        retrieveUser().then(function (user) {
            localStorage.user = JSON.stringify(user);
            cb(localStorage.user);
        });
    }

    /**
     * Retrieve profiles of the logged parent/teacher
     */
    /*dataServerService.getBabyProfiles = function () {
        var deferred = $q.defer();
        $http.get('data/bambino-profilo.json').success(function (data) {
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
        })
        return deferred.promise;
    }*/

    /* dataServerService.getBabyProfiles = function () {
         var deferred = $q.defer();
         $http({
             method: 'GET',
             url: Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/scuola2/kids/kid2?isTeacher=true',
             headers: {
                 'Accept': 'application/json'
             },
             timeout: Config.httpTimout()
         }).
         success(function (data, status, headers, config) {
             deferred.resolve(data.data);
         }).
         error(function (data, status, headers, config) {
             console.log(data + status + headers + config);
             deferred.reject(status);
         });
         return deferred.promise;
     }*/

    //    dataServerService.save = function (post) {
    //        return dataServerService.getPostsByBabyId();
    //    }

    /**
     * Retrieve tags to be used
     */
    dataServerService.getTags = function (schoolId) {
        //var tags = null;
        var deferred = $q.defer();

        // temp
        if (tags == null) {
            //$http.get('data/post-tags.json').success(function (data) { /diary/{appId}/{schoolId}/tags
            $http({
                method: 'GET',
                url: Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/tags',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: Config.httpTimout()
            }).
            success(function (data, status, headers, config) {
                if (data.data) {
                    var tagsServer = data.data;
                    tags = [];
                    for (var i = 0; i < tagsServer.length; i++) {
                        tags.push({
                            "tagId": i,
                            "name": tagsServer[i]
                        });
                    }
                    //tags = data;
                    deferred.resolve(tags);
                } else {
                    deferred.reject();

                }
            }).error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                deferred.reject();
            });
        } else {
            deferred.resolve(tags);
        }
        return deferred.promise;
    };

    /**
     * Retrieve child posts
     */
    /* dataServerService.getPostsByBabyId = function (babyId, start, count) {
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
     */



    /*

    Upload a photo:
	POST
     /diary/{appId}/{schoolId}/{kidId}/image?isTeacher=<true|false>
	Multipart request (‘image’ param)
	Upload a new photo.

	Return imageId


    */
    function imageIsLocal(schoolId, kidId, file) {
        if (file.indexOf(Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/' + kidId) === 0)
            return false;
        return true;
    }

    function getImageId(schoolId, kidId, file) {
        return file.substring((Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/' + kidId).length + 1, file.length - '/image'.length);
    }
    dataServerService.addPicture = function (schoolId, kidId, file) {
        var deferred = $q.defer();

        var win = function (r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
            if (r.response) {
                try {
                    var data = JSON.parse(r.response);
                    deferred.resolve(data.data);

                } catch (e) {
                    deferred.reject();
                }
            } else {
                deferred.reject();
            }
        }

        var fail = function (error) {
            alert("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
            deferred.reject(error);
        }

        var options = new FileUploadOptions();
        options.fileKey = "image";


        var ft = new FileTransfer();
        if (imageIsLocal(schoolId, kidId, file)) {
            ft.upload(file, Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/' + kidId + '/image?isTeacher=' + dataServerService.isATeacher(), win, fail, options);
        } else {
            deferred.resolve(getImageId(schoolId, kidId, file));
        }
        return deferred.promise;
    };

    function setTagsAttribute(tagsObject) {
        var arrayOfTags = [];
        for (var k = 0; k < tagsObject.length; k++) {
            if (tagsObject[k]) {
                if (tagsObject[k].name) {
                    arrayOfTags.push(tagsObject[k].name);
                } else {
                    arrayOfTags.push(tagsObject[k]);
                }
            }
        }
        return arrayOfTags;

    }

    /**
     * Remove child posts
     */
    dataServerService.removePost = function (schoolId, kidId, notaId) {
        var deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/' + kidId + '/' + notaId + '/entry?isTeacher=' + dataServerService.isATeacher(),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve();
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject();
        });
        return deferred.promise;
    };

    /**
     * Add a new post
     */
    dataServerService.addPost = function (schoolId, kidId, nota) {
        var deferred = $q.defer();
        //upload all images and after create note with url of images
        var immaginiUrl = [];
        var urlCall, methodCall;
        if (nota.entryId) {
            urlCall = Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/' + kidId + '/' + nota.entryId + '/entry?isTeacher=' + dataServerService.isATeacher();
            methodCall = 'PUT';
        } else {
            urlCall = Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/' + kidId + '/entry?isTeacher=' + dataServerService.isATeacher();
            methodCall = 'POST';
        }
        if (!nota.pictures || nota.pictures.length == 0) {
            nota.tags = setTagsAttribute(nota.tags);
            $http({
                method: methodCall,
                url: urlCall,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: Config.httpTimout(),
                data: {
                    "schoolId": schoolId,
                    "kidId": kidId,
                    "date": nota.date.getTime(),
                    "text": nota.text,
                    "tags": nota.tags,
                    "authorId": nota.authorId
                }
            }).
            success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                console.log(data + status + headers + config);
                deferred.reject(data);
            });
        } else {
            var uploadFunction = [];
            for (var k = 0; k < nota.pictures.length; k++) {
                uploadFunction.push(
                    dataServerService.addPicture(schoolId, kidId, nota.pictures[k]).then(function (pictureId) {
                        ///diary/{appId}/{schoolId}/{kidId}/{imageId}/image
                        immaginiUrl.push(Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/' + kidId + '/' + pictureId + '/image');
                    }))
            };
            $q.all(uploadFunction)
                .then(function (values) {
                    //create nota with new url
                    nota.tags = setTagsAttribute(nota.tags);

                    $http({
                        method: methodCall,
                        url: urlCall,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        timeout: Config.httpTimout(),
                        data: {
                            "schoolId": schoolId,
                            "kidId": kidId,
                            "date": nota.date.getTime(),
                            "text": nota.text,
                            "tags": nota.tags,
                            "pictures": immaginiUrl,
                            "authorId": nota.authorId
                        }
                    }).
                    success(function (data, status, headers, config) {
                        deferred.resolve(data);
                    }).
                    error(function (data, status, headers, config) {
                        console.log(data + status + headers + config);
                        deferred.reject(data);
                    });
                    //return values;
                });

        }

        return deferred.promise;
    }

    /**
     * Retrieve child posts by babyid
     */
    dataServerService.getPostsByBabyId = function (schoolId, kidId, from, to, length) {
        var deferred = $q.defer();
        var urlPosts = Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/' + kidId + '/entries?isTeacher=' + dataServerService.isATeacher() + '&from=' + from + '&to=' + to + '&pageSize=' + 10;
        if (length) {
            urlPosts += '&skip=' + length;
        }
        $http({
            method: 'GET',
            url: urlPosts,
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            var post = data.data;
            //add author name and relationship

            deferred.resolve(post);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(status);
        });
        return deferred.promise;
    }

    /**
     * Retrieve child posts
     */
    dataServerService.getGalleryByBabyId = function (schoolId, kidId, start, count) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: Config.URL() + '/' + Config.app() + '/diary/' + Config.appId() + '/' + schoolId + '/' + kidId + '/gallery?isTeacher=' + dataServerService.isATeacher(),
            headers: {
                'Accept': 'application/json'
            },
            timeout: Config.httpTimout()
        }).
        success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(status);
        });
        //        dataServerService.getPostsByBabyId(babyId, start, count).then(function (posts) {
        //            var res = [];
        //            for (var i = 0; i < posts.length; i++) {
        //                if (posts[i].pictures) {
        //                    for (var j = 0; j < posts[i].pictures.length; j++) {
        //                        res.push({
        //                            url: posts[i].pictures[j].url,
        //                            date: posts[i].date
        //                        });
        //                    }
        //                }
        //            }
        //            deferred.resolve(res);
        //        });
        return deferred.promise;
    }


    return dataServerService;
})
