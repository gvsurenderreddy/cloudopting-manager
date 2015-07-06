'use strict';

angular.module('cloudoptingApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('instances', {
                parent: 'service',
                url: '/instances',
                data: {
                    roles: ['ROLE_ADMIN', 'ROLE_SUBSCRIBER']
                },
                views: {
                    'content@': {
                        templateUrl: 'scripts/app/service/instances/instances.html',
                        controller: 'InstancesController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('instances');
                        return $translate.refresh();
                    }]
                }
            });
    });
