angular.module('authService', [])
// ===================================================
// auth factory to login and get information
// inject $http for communicating with the API
// inject $q to return promise objects
// inject AuthToken to manage tokens
// ===================================================
.factory('Auth', function($http, $q, AuthToken) {

  // create auth factory object
  var authFactory = {};

  // handle login
  authFactory.login = function(username, password) {
    return $http.post('/api/authenticate', {
      username: username,
      password: password
    })
      .success(function(data) {
        AuthToken.setToken(data.token);
        return data;
      });
  };

  // handle logout
  authFactory.logout = function() {
    // clear token
    AuthToken.setToken();
  };

  // check if a user is logged in 
  authFactory.isLoggedIn = function() {
    if (AuthToken.getToken()) {
      return true;
    } else {
      return false;
    }
  };

  // get the user info
  authFactory.getUser = function() {
    if (AuthToken.getToken()) {
      return $http.get('/api/me', { cache: true });
    } else {
      return $q.reject({ message: 'User has no token.' });
    }
  };

  // return auth factory object
  return authFactory;

})
// ===================================================
// factory for handling tokens
// inject $window to store token client-side
// ===================================================
.factory('AuthToken', function($window) {

  var authTokenFactory = {};

  // get the token out of local storage
  authTokenFactory.getToken = function() {
    return $window.localStorage.getItem('token');
  };

  // set the token or clear the token
  authTokenFactory.setToken = function(token) {
    if (token) {
      $window.localStorage.setItem('token', token);
    } else {
      $window.localStorage.removeItem('token');
    }
  };

  return authTokenFactory;

})
// ===================================================
// application configuration to integrate token into requests
// ===================================================
.factory('AuthInterceptor', function($q, AuthToken) {
  var interceptorFactory = {};

  // attach the token to every request
  interceptorFactory.request = function(config) {

    // grab token
    var token = AuthToken.getToken();

    if (token) {
      config.headers['x-access-token'] = token;
    }

    return config;
  };

  // redirect if a token doesn't authenticate
  interceptorFactory.responseError = function(response) {

    // if our server returns a 403 forbidden response
    if (response.status == 403) {
      $location.path('/login');
    }
    return $q.reject(response);
  };

  return interceptorFactory;

});