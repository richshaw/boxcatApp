angular.module('boxCatApp', ['config','ngRoute','ngSanitize','auth0-redirect','authInterceptor'])


  .factory("boxCatApi", function($http,ENV){

    var boxCatApi = {};

    boxCatApi.getProjects = function () {
        return $http.get(ENV.apiEndPoint + '/project');
    };

    boxCatApi.getProject = function (id) {
        return $http.get(ENV.apiEndPoint + '/project/' + id);
    };

    boxCatApi.createProject = function (project) {
        return $http.post(ENV.apiEndPoint + '/project', project);
    };

    boxCatApi.updateProject = function (project) {
        return $http.put(ENV.apiEndPoint + '/project/' + project.id, project);
    };

    boxCatApi.deleteProject = function (id) {
        return $http.delete(ENV.apiEndPoint + '/project/' + id);
    };

    boxCatApi.getProjectArtifacts = function (id) {
        return $http.get(ENV.apiEndPoint + '/project/' + id + '/artifact');
    };

    boxCatApi.getProjectArtifact = function (pId,aId) {
        return $http.get(ENV.apiEndPoint + '/project/' + pId + '/artifact/' +  aId);
    };

    boxCatApi.createProjectArtifact = function (pId,artifact) {
        return $http.post(ENV.apiEndPoint + '/project/' + pId + '/artifact', artifact);
    };

    boxCatApi.deleteProjectArtifact = function (pId,aId) {
        return $http.delete(ENV.apiEndPoint + '/project/' + pId + '/artifact/' +  aId);
    };

    return boxCatApi;

  })


  .controller('MenuCtrl', function ($scope, $location) {
    $scope.go = function (target) {
      $location.path(target);
    };
  })

  .controller('AppCtrl', function ($scope, auth) {
    $scope.message = 'loading...';
    auth.loaded.then(function () {
      $scope.message = '';
    });
  })

  .controller('MenuCtrl', function ($scope, $location, $http, auth) {

  })

  /**
  Get list of projects from API
  */
  .controller('ProjectListCtrl', function($scope, $http, boxCatApi) {
      
      $scope.status = ''; //TODO 
      $scope.projects = [];
      $scope.newProject  = {};

      //On initial load
      loadProjects();

      function loadProjects() {
        boxCatApi.getProjects()
          .success(function (data) {
              $scope.projects = data.data;
          })
          .error(function (error) {
              $scope.status = 'Unable to load projects: ' + error.message;
          });
      }

      //On clicks
      $scope.createProject = function (project) {

          //No artifacts of creation on new project
          project.artifact = {};

          boxCatApi.createProject(project)
              .success(function (data) {
                  $scope.status = 'Created project!';
                  //Add newly created project to list
                  $scope.projects.push(data.data);
              })
              .error(function(error) {
                  $scope.status = 'Unable to delete project: ' + error.message;
              });
      };



      $scope.deleteProject = function (project) {

          boxCatApi.deleteProject(project.id)
              .success(function () {
                  $scope.status = 'Deleted project!';
                  //Remove project object  from list
                  var index = $scope.projects.indexOf(project)
                  $scope.projects.splice(index, 1);  
              })
              .error(function(error) {
                  $scope.status = 'Unable to delete project: ' + error.message;
              });
      };

      $scope.newProject.access = 1;
  })

  /**
  View project details
  View list of artifacts
  */
  .controller('ProjectViewCtrl', function($scope, $http, boxCatApi, $routeParams) {
      
      //Get project data
      $scope.project = [];

      //On initial load
      loadProject($routeParams.projectId);

      function loadProject(id) {
        boxCatApi.getProject(id)
          .success(function (data) {
              $scope.project = data.data;
              //TODO add real values
              $scope.project.email = $scope.project.id + "@boxcat.io";
              $scope.project.phone = "+19178550037";
          })
          .error(function (error) {
              $scope.status = 'Unable to load projects: ' + error.message;
          });
      }

      //Get artifact data
      $scope.artifacts = [];

      //On initial load
      loadArtifacts($routeParams.projectId);

      function loadArtifacts(id) {
        boxCatApi.getProjectArtifacts(id)
          .success(function (data) {
              $scope.artifacts = data.data;
          })
          .error(function (error) {
              $scope.status = 'Unable to load projects: ' + error.message;
          });
      }

      //Trigger file upload dialoge on click
      //https://developers.inkfilepicker.com/docs/web/
      $scope.fileUpload = function($event) {
        $event.preventDefault()

        filepicker.setKey('ArJvm0QBMSXDBxXb1wC1wz');

        filepicker.pickMultiple(function(InkBlobs){
           var uploads = InkBlobs;
           //Send each file request to API
           //Gte project Id
           var pId = $routeParams.projectId;
           angular.forEach(uploads, function(value, key) {

              var artifact = {}
              artifact.filename = value.url;
              artifact.metaData = [];

              boxCatApi.createProjectArtifact(pId,artifact)
                  .success(function (data) {
                      $scope.status = 'Created artifact!';
                       //Add newly created project to list
                      $scope.artifacts.push(data.data);
                  })
                  .error(function(error) {
                      $scope.status = 'Unable to create artifact: ' + error.message;
                  });

           }); //End forEach

        });
      };
      
  })


  /**
  View project details
  View list of artifacts
  */
  .controller('ArtifactViewCtrl', function($scope, $http, boxCatApi, ENV,$routeParams, $sce) {
      
      //Get project data
      $scope.artifact = [];


      //On initial load
      loadArtifact($routeParams.projectId,$routeParams.artifactId);

      function loadArtifact(pId,aId) {
        boxCatApi.getProjectArtifact(pId,aId)
          .success(function (data) {
              $scope.artifact = data.data;
              //Set artifact download URL
              $scope.artifact.download =  ENV.apiEndPoint + '/project/' + $routeParams.projectId + '/artifact/' + $routeParams.artifactId + '/download';
          
              //Do we have any metaData?
              //Controls show and hide in view
              if(Object.getOwnPropertyNames($scope.artifact.metaData).length == 0) {
                $scope.artifact.metaData = false;
              }
          })
          .error(function (error) {
              $scope.status = 'Unable to load artifact: ' + error.message;
          });
      }

      //We don't need full project object just get ID from URL
      $scope.projectId = $routeParams.projectId;

      //Let Ng know these external urls are trusty
      $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
      }
      
  })


  .controller('LogoutCtrl', function (auth, $scope, $location) {
    auth.signout();
    $scope.$parent.message = '';
    $location.path('/login');
  })

  .controller('LoginCtrl', function (auth, $scope, $location) {
    $scope.user = '';
    $scope.pass = '';

    function onLoginSuccess() {
      $scope.$parent.message = '';
      $location.path('/project');
    }

    function onLoginFailed() {
      $scope.$parent.message = 'invalid credentials';
    }

    $scope.submit = function () {
      $scope.$parent.message = 'loading...';
      $scope.loading = true;

      auth.signin({
        connection: 'Username-Password-Authentication',
        username: $scope.user,
        password: $scope.pass,
        scope: 'openid name email'
      }).then(onLoginSuccess, onLoginFailed)
      .finally(function () {
        $scope.loading = false;
      });
    };

    $scope.doGoogleAuthWithPopup = function () {
      $scope.$parent.message = 'loading...';
      $scope.loading = true;    

      auth.signin({
        popup: true,
        connection: 'google-oauth2',
        scope: 'openid name email'
      }).then(onLoginSuccess, onLoginFailed)
      .finally(function () {
        $scope.loading = false;
      });
    };

  })

  .run(function ($rootScope, $location, AUTH_EVENTS, $timeout) {

    $rootScope.$on('$routeChangeError', function () {
      var otherwise = $route.routes && $route.routes.null && $route.routes.null.redirectTo;
      $timeout(function () {
        $location.path(otherwise);
      });
    });
  
  })

  .config(function ($routeProvider, $locationProvider, $httpProvider, authProvider, AUTH0) {
    //configure the routing rules here
    $routeProvider

    .when('/project', {
        templateUrl : "pages/projectList.html",
        controller: "ProjectListCtrl",
        resolve: { isAuthenticated: isAuthenticated }
    })

    .when('/project/:projectId', {
        templateUrl : "pages/projectView.html",
        controller: "ProjectViewCtrl",
        resolve: { isAuthenticated: isAuthenticated }
    })

    .when('/project/:projectId/artifact/:artifactId', {
        templateUrl : "pages/artifactView.html",
        controller: "ArtifactViewCtrl",
        resolve: { isAuthenticated: isAuthenticated }
    })

    .when('/project/:projectId/upload', {
        templateUrl : "pages/artifactUpload.html",
        controller: "ProjectUploadCtrl",
        resolve: { isAuthenticated: isAuthenticated }
    })
    // Where the user will follow in order to close their session.
    .when('/logout',  { 
      templateUrl: 'pages/logout.html',   
      controller: 'LogoutCtrl'
    })
    // Where the user will input their credentials.
    .when('/login',   { 
      templateUrl: 'pages/login.html',    
      controller: 'LoginCtrl'   
    })

    .otherwise({ redirectTo: '/login' });

    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;

    //routing DOESN'T work without html5Mode
    $locationProvider.html5Mode(true);

    //Enable Auth provider
    authProvider.init({ 
      domain: AUTH0.domain, clientID: AUTH0.clientId, callbackURL: AUTH0.callbackUrl
    });

    // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
    // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might 
    // want to check the delegation-token example
    $httpProvider.interceptors.push('authInterceptor');

  });


function isAuthenticated($q, auth) {
  var deferred = $q.defer();

  auth.loaded.then(function () {
    if (auth.isAuthenticated) {
      deferred.resolve();
    } else {
      deferred.reject();
    }
  });
  return deferred.promise;
}

// Make it work with minifiers
isAuthenticated.$inject = ['$q', 'auth'];



