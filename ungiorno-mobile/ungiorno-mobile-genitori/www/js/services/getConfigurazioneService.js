angular.module('it.smartcommunitylab.infanziadigitales.diario.parents.services.getConfigurationService', [])

.factory('getConfigurationService', function ($http, $q, DatiDB) {
    var babyConfiguration = null;
    var configurationService = {};


    configurationService.getBabyConfiguration = function (from) {
        /*temp*/
        $http.get('data/bambino-configurazione.json').success(function (data) {
            babyConfiguration = data;
            if (from == 0)
                deferred.resolve(babyConfiguration);
            else deferred.resolve([]);
        }).error(function (data, status, headers, config) {
            console.log(data + status + headers + config);
            deferred.reject(err);
        });
        return deferred.promise;
        /*temp*/
    }


    return profileService;
})
