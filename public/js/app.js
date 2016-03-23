var app = angular.module('talksApp', []);

function getTalks($scope, $http) {
  // send the GET request
  $http.get("/api/talks").success(data => {
    $scope.talks = data; // Set the scope's talks to be the output of the api call
  });
}

function postTalk($scope, $http) {
  // Set the data to be sent through the request to be the newTalk object
  var data = $scope.newTalk;

  // Send the POST request
  $http.post("/api/postTalk", data).then(response => {
    $scope.talks = response.data; // Set the scope's talks to be the output of the api call
  });
}

// The main controller for the page
app.controller('talksController', ($scope, $http) => {
  getTalks($scope, $http); // Always load in talks at startup

  // Send a http POST request to create a new talk
  $scope.createTalk = () => {
    postTalk($scope, $http);
    $scope.newTalk = {}; // Clear out the input boxes
  };

  // Hide a certain talk
  $scope.hide = () => {

  };

  // unhide a certain talk
  $scope.unhide = () => {

  };
});
