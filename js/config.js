angular.module('config', [])

.constant('ENV', {
  'name': 'development',
  'apiEndPoint': 'http://localhost:8888/index.php' 
})

.constant('AUTH0', {
  'domain': 'boxcat.auth0.com',
  'clientId': 'RATdj9Kt0azJ9UGvYTt7ezaxUVz23JCc',
  'callbackUrl': 'http://localhost:8000/'
});