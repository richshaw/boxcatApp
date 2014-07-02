angular.module('config', [])

.constant('ENV', {
  'name': 'development',
  'apiEndPoint': 'http://localhost:8888/index.php' 
})

.constant('AUTH0', {
  'domain': 'gouzout.auth0.com',
  'clientId': 'ePe1RLcew10DOzkZFB728pTEigpCCExb',
  'callbackUrl': 'http://localhost:8000/'
});