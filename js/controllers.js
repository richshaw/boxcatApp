angular.module('boxCatApp', ['config','ngRoute','ngSanitize'])


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
      
  })


  /**
  View project details
  View list of artifacts
  */

  /**********
  * TODO IMPLEMENT REST FACTORY
  *
  */
  .controller('ArtifactViewCtrl', function($scope, $http, ENV, $routeParams, $sce) {
      
      //Get project data
      $scope.artifact = [];

      var endPoint = ENV.apiEndPoint + '/project/' + $routeParams.projectId + '/artifact/' + $routeParams.artifactId;

      var responsePromise = $http.get(endPoint);

      responsePromise.success(function(data, status, headers, config) {
          $scope.artifact = data.data;
          $scope.artifact.download =  endPoint + '/download';
          
          //Do we have any metaData?
          //Controls show and hide in html
          if(Object.getOwnPropertyNames($scope.artifact.metaData).length == 0) {
            $scope.artifact.metaData = false;
          }

      });
      responsePromise.error(function(data, status, headers, config) {
          alert("Server error");
      });

      $scope.projectId = $routeParams.projectId;

      $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
      }
      
  })


  .controller('ProjectUploadCtrl', function($scope, $http, ENV, $routeParams) {
    
    //Trigger file upload dialoge
    //https://developers.inkfilepicker.com/docs/web/
    $scope.fileUpload = function($event) {
      $event.preventDefault()

      filepicker.setKey('ArJvm0QBMSXDBxXb1wC1wz');

      filepicker.pickMultiple(function(InkBlobs){
         var uploads = InkBlobs;
         //Send each file request to API
         angular.forEach(uploads, function(value, key) {

          var endPoint = ENV.apiEndPoint + '/project/' + $routeParams.projectId + '/artifact';

          var postData = {}
          postData.filename = value.url;
          postData.metaData = [];

          var responsePromise = $http.post(endPoint,postData);

          responsePromise.success(function(data, status, headers, config) {
            console.log(data);
          });
          responsePromise.error(function(data, status, headers, config) {
              alert("Server error");
          });

         }); //End forEach

      });
    };

  })


  .config(function ($routeProvider, $locationProvider, $httpProvider) {
    //configure the routing rules here
    $routeProvider.when('/project', {
        templateUrl : "pages/projectList.html",
        controller: "ProjectListCtrl"
    })

    .when('/project/:projectId', {
        templateUrl : "pages/projectView.html",
        controller: "ProjectViewCtrl"
    })

    .when('/project/:projectId/artifact/:artifactId', {
        templateUrl : "pages/artifactView.html",
        controller: "ArtifactViewCtrl"
    })

    .when('/project/:projectId/upload', {
        templateUrl : "pages/artifactUpload.html",
        controller: "ProjectUploadCtrl"
    });

    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;

    //routing DOESN'T work without html5Mode
    $locationProvider.html5Mode(true);
  });



