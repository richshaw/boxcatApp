angular.module('config', [])

.constant('ENV', {
  'name': 'development',
  'apiEndPoint': 'http://localhost:8888/index.php' 
})

.constant('AUTH0', {
  'domain': DOMAIN,
  'clientId': KEY,
  'callbackUrl': 'http://localhost:8000/'
});
