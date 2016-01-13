var sampleApp = angular.module('sampleApp', ['ui.router', 'ui.bootstrap']);

var PASSPORT_LOCAL_TEST = true;

function parseURL(url) {
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for( i = 0; i < queries.length; i++ ) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };
}

sampleApp.config(function($stateProvider, $urlRouterProvider) {
    
    $stateProvider
    .state('home', {
        url: '/',
        views: {
            'home': {
                templateUrl: 'home.html',
                controller: 'sampleCtrl'
            },
        }
    })
    .state('home.sidebar', {
        url: '/{userId}',
        views: {
            'homelinks': {
                templateUrl: 'home.links.html',
                controller: 'updateLinks'
            },
            'activeUser@': {
                template: function() { 
                    return '<strong>{{userName}}</strong> {{email}} <a href={{logout}}>Logout</a>';
                },
                controller: 'setUserName'
            }
        }
    })
    .state('home.sidebar.overview', {
        url: '/details',
        views: {
            'overview@home': {
                templateUrl: 'home.overview.html',
                controller: 'getDetails'
            }
        }
    })
    .state('home.sidebar.address', {
        url: '/address',
        views: {
            'overview@home': {
                templateUrl: 'home.address.html',
                controller: 'getAddress'
            }
        }
    })
    .state('home.sidebar.employer', {
        url: '/employer',
        views: {
            'overview@home': {
                templateUrl: 'home.employer.html',
                controller: 'getEmployer'
            }
        }
    })
    .state('home.sidebar.children', {
        url: '/children',
        views: {
            'overview@home': {
                templateUrl: 'home.children.html',
                controller: 'getChildren'
            }
        }
    });
     
});

function redirectToLoginPage ($window) {
    if (PASSPORT_LOCAL_TEST) {
        var url = "http://" + 'localhost:5001' + "/authfailure";
    } else {
        var url = "https://" + $window.location.host + "/authfailure";
    }
    console.log("REDIRECTING TO URL : " + url);
    $window.location.href = url;
}

sampleApp.run(['$rootScope', '$state', '$stateParams', '$location',
            function($rootScope, $state, $stateParams, $location) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    
    if (PASSPORT_LOCAL_TEST) {
        $rootScope.apiUrl = 'http://localhost:5003/';
    } else {
        $rootScope.apiUrl = '/api/';;
    }

    console.log("API URL : "+$rootScope.apiUrl);

    if ((parseURL($location.$$absUrl)).searchObject.Token) {
        console.log("JWT : " + (parseURL($location.$$absUrl)).searchObject.Token);
        $rootScope.JWToken = '?Token='+(parseURL($location.$$absUrl)).searchObject.Token;
    } else {
        console.log("TOKEN not present");
        $rootScope.JWToken = '';
    }
    
    $state.go('home');
}]);

sampleApp.controller('sampleCtrl', ['$rootScope', '$stateParams', '$state', '$scope', '$http', '$location', '$window',
                    function ($rootScope, $stateParams, $state, $scope, $http, $location, $window) {
    $scope.activeuser = ' Select User ';
    $scope.getUsers = function () {
        var url = $rootScope.apiUrl+'users'+$rootScope.JWToken;
        console.log("____URL____ = "+url);

        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            console.log('RESPONSE: ' + response.data);
            $scope.list = response.data.users;
            $scope.email = response.data.email;
            
            console.log('Users : ');
            console.log($scope.list);
            console.log('EMAIL : ');
            console.log($scope.email);
            // resolve(response);
            return;
        }, function errorCallback(response) {
            console.log("Error on get " + url + response);
            if (response.status == 403) redirectToLoginPage($window);
            return;
            // reject(response);
        });
    }
}]);

sampleApp.controller('updateLinks', ['$rootScope', '$stateParams', '$scope', 
                    function ($rootScope, $stateParams, $scope) {

    if (typeof($stateParams.userId) === 'undefined') {
        console.log("updateLinks controller StateParams userId undefined using scope value = "+$scope.userId);
    } else {
        console.log("updateLinks controller SatetParams userId defined = "+$stateParams.userId);
        $scope.userId = $stateParams.userId;
        $rootScope.userId = $stateParams.userId;
    }
    
    console.log("Scope.list = ");
    console.log($scope.list);

    for (var i=0;i<$scope.list.length;i++) {
        console.log("I = " + i + " userId = " + $scope.list[i].id);
        if ($scope.list[i].id == $stateParams.userId) {
            $rootScope.userName = $scope.list[i].name;
            $rootScope.userType = $scope.list[i].type;
            if ($rootScope.userType == 'superPerson') {
                $rootScope.superperson = true;
                $rootScope.normalperson = false;
            } else {
                $rootScope.superperson = false;
                $rootScope.normalperson = true;
            }
        }
    }

}]);

sampleApp.controller('setUserName', ['$rootScope', '$stateParams', '$scope', 
                    function ($rootScope, $stateParams, $scope) {
    for (var i=0;i<$scope.list.length;i++) {
        if ($scope.list[i].id == $stateParams.lientId) {
            $rootScope.userName = $scope.list[i].name;
        }
     }
     if (PASSPORT_LOCAL_TEST) {
        $scope.logout = 'http://localhost:5001/logout';
     } else {
        $scope.logout = '/logout';
    }
}]);

sampleApp.controller('userCtrl', ['$rootScope', '$stateParams', '$state', '$scope', '$http', '$location',
                    function ($rootScope, $stateParams, $state, $scope, $http, $location) {
    $scope.getTime = function(ltime) {
        // var time = new Date().getTime();
        var ntime = Number(ltime);
        var date = new Date(ntime*1000);
        return(date.toString());
    }
}]);

sampleApp.controller('getDetails', ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$location', '$window',
                    function($rootScope, $scope, $http, $stateParams, $state, $location, $window) {                    
    url=$rootScope.apiUrl+$stateParams.userId+'/details'+$rootScope.JWToken;
    $http({
        method: 'GET',
        url: url
    })
    .then(function successCallback(response) {
        $scope.userDetails = response.data;
    }, function errorCallback(response) {
        // console.log("Error on getDetails" + url + response);
        if (response.status == 403) redirectToLoginPage($window);
    });
}]);

sampleApp.controller('getAddress', ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$location', '$window',
                    function($rootScope, $scope, $http, $stateParams, $state, $location, $window) {                   
    url=$rootScope.apiUrl+$stateParams.userId+'/address'+$rootScope.JWToken;
    $http({
        method: 'GET',
        url: url
    })
    .then(function successCallback(response) {
        $scope.address = response.data;
    }, function errorCallback(response) {
        // console.log("Error on getAddress" + url + response);
        if (response.status == 403) redirectToLoginPage($window);
    });
}]);

sampleApp.controller('getEmployer', ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$location', '$window',
                    function($rootScope, $scope, $http, $stateParams, $state, $location, $window) {                    
    url=$rootScope.apiUrl+$stateParams.userId+'/employer'+$rootScope.JWToken;
    $http({
        method: 'GET',
        url: url
    })
    .then(function successCallback(response) {
        $scope.employer = response.data;
    }, function errorCallback(response) {
        // console.log("Error on getEmployer" + url + response);
        if (response.status == 403) redirectToLoginPage($window);
    });
}]);

sampleApp.controller('getChildren', ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$location', '$window',
                    function($rootScope, $scope, $http, $stateParams, $state, $location, $window) {                   
    url=$rootScope.apiUrl+$stateParams.userId+'/children'+$rootScope.JWToken;
    $http({
        method: 'GET',
        url: url
    })
    .then(function successCallback(response) {
        $scope.children = response.data;
    }, function errorCallback(response) {
        // console.log("Error on getChildren" + url + response);
        if (response.status == 403) redirectToLoginPage($window);
    });
}]);
