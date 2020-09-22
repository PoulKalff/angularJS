
var app = angular.module('mainApp', ['ngCookies', 'ngRoute']);

// custom filter for translating weekday-numbers to text
app.filter('weekdays',function(){
	return function(input)
	{
		var newString = input.map(function(x){ return { 1:'Mon', 2:'Tue', 3:'Wed', 4:'Thu', 5:'Fri', 6:'Sat', 7:'Sun'}[x]}).toString().replace(/,/g,'-');
		if (newString == 'Mon-Tue-Wed-Thu-Fri-Sat-Sun') 
			return 'All';
		else
			return newString;
	}
});


var genre_dict = 
{ 
	"0" : [ "#898a8d", "Undefined" ],
	"1" : [ "#ad8f72", "Movie / Drama" ],
	"2" : [ "#657665", "News / Current affairs" ],
	"3" : [ "#adad72", "Show / Game show" ],
	"4" : [ "#b36f77", "Sports" ],
	"5" : [ "#72ada6", "Children's / Youth programs" ],
	"6" : [ "#7fb282", "Music / Ballet / Dance" ],
	"7" : [ "#6d80b1", "Arts / Culture (without music)" ],
	"8" : [ "#838384", "Social / Political issues / Economics" ],
	"9" : [ "#9b759b", "Education / Science / Factual topics" ],
	"a" : [ "#9797aa", "Leisure hobbies" ],
	"b" : [ "#9797bb", "Special" ] 
};


// determines the type af a recording status
function getRecordingStatusIcon(status) {
	switch (status) {
		case 'scheduled':
			return 'static/img/watch.png';
		case 'recording':
			return'static/img/recording.png';
		case 'completed':
			return 'static/img/recCompleted.png';
		case 'completedError':
			return 'static/img/recCompleted.png';
		case 'completedWarning':
			return 'static/img/recCompleted.png';
		case 'completedRerecord':
			return 'static/img/recCompleted.png';
		}
	return '';
}


// formats EPG time to match universal time
function getUniversalTime(seconds) {	
	secondsString = seconds.toString();
	return parseInt(secondsString + '000');
}


function http_build_query( arrayIn ) {
	var tmp_arr = [];
	for (key in arrayIn) {
		tmp_arr.push(key.toString() + '=' + arrayIn[key].toString());
	}
	return tmp_arr.join('&');
}


// generic function to make a POST to an API 											// should support returning data
function httpPost(url, dataRaw, successMessage) {
	var data = http_build_query(dataRaw);
	var headers = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}};
	$http.post(url, data, headers)
	.then(function (response)
	{
		if (response.data) {
			$scope.showInfobox(successMessage);
		}
	}, function (response)
	{
		alert('Sorry, an error occurred. API response was : "(' + response.status + ')"');
	});
}


// controller for all common functions
app.controller("commonController", function ($scope, $http, $interval, $timeout, $cookies) {


	// show an infobox for x seconds, then remove it
	$scope.showInfobox = function(text) {
		// check if one or more infoboxes exist already
		var infoBoxContainer = document.getElementById('infoBoxContainer')
		var infoBox = document.createElement('div');
		infoBox.setAttribute("class", "infoBox");
		infoBox.innerHTML = text;
		infoBoxContainer.append(infoBox);
		setTimeout(function () {
			angular.element(infoBox).addClass("fadedOut");
		}, 3000);
		setTimeout(function () {
			infoBox.parentNode.removeChild(infoBox);
		}, 6000);
	}


	$scope.showHideSidebar = function() {
		var sideNavDiv = document.getElementsByClassName("sidenav")[0];
		var bottomDiv = document.getElementById("epg_bottom");
		var mainDiv = document.getElementsByClassName("main")[0];
		angular.element(sideNavDiv).toggleClass("sidenav_small");	// toggle this, use its status to determine others
		if (sideNavDiv['className'] == "sidenav sidenav_small") {
			angular.element(mainDiv).addClass("main_big");
			$cookies.put('mainMenuCollapsed', true);
		}
		else{
			angular.element(mainDiv).removeClass("main_big");
			$cookies.put('mainMenuCollapsed', false);
		}
	};

}); // controller ends



app.config(function($routeProvider) {
	$routeProvider
	.when("/", {
		templateUrl : "static/templates/welcome_page.html"
	})
	.when("/epg", {
		templateUrl : "static/templates/epg_page.html",
		controller : "epgController"
	})
	.when("/dvr", {
		templateUrl : "static/templates/dvr_page.html",
		controller : "dvrController"
	})
	.when("/conf", {
		templateUrl : "static/templates/conf_page.html",
		controller : "configController"
	})
	.when("/status", {
		templateUrl : "static/templates/status_page.html",
		controller : "statusController"
	})
	.when("/about", {
		templateUrl : "static/templates/about_page.html",
		controller : "aboutController"
	});
});


// controller for loading a status-page
app.controller("statusController", function ($scope, $http) {
	var sideNavDiv = document.getElementsByClassName("sidenav")[0];
	var mainDiv = document.getElementsByClassName("main")[0];
	if (sideNavDiv['className'] == "sidenav sidenav_small") 
		angular.element(mainDiv).addClass("main_big");
	else
		angular.element(mainDiv).removeClass("main_big");
	$http.get("/api/status/inputs")
		.then(function (response) {	$scope.streamData = response.data.entries });
	$http.get("/api/status/subscriptions")
		.then(function (response) {	$scope.subscriptionsData = response.data.entries });
	$http.get("/api/status/connections")
		.then(function (response) {	$scope.connectionsData = response.data.entries });
	$http.get("/api/service/mapper/status")
		.then(function (response) {	$scope.serviceMapperData = response.data });
	$http.get("/api/serverinfo")
		.then(function (response) {	$scope.serverInfo = response.data });
	$http.get("/api/memoryinfo/grid")
		.then(function (response) {	$scope.memoryInfo = response.data });
	$scope.clearStreamStats = function(uuid) {
		var url = '/api/status/inputclrstats';
		var data = http_build_query({ "uuid": uuid });
		var headers = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}};
		$http.post(url, data, headers)
		.then(function (response)
		{
			if (response.data) {
				$scope.showInfobox('Stream statistics cleared');
				$http.get("/api/status/inputs")
					.then(function (response) {	$scope.streamData = response.data.entries });
			}
		}, function (response)
		{
			alert('Sorry, an error occurred. API response was : "(' + response.status + ')"');
		});
	}

	$scope.dropConnection = function(id) {
		var url = '/api/connections/cancel';
		var data = http_build_query({ "id": id });
		var headers = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}};
		$http.post(url, data, headers)
		.then(function (response)
		{
			if (response.data) {
				$scope.showInfobox('Connection dropped');
				$http.get("/api/status/connections")
					.then(function (response) {	$scope.connectionsData = response.data.entries });
			}
		}, function (response)
		{
			alert('Sorry, an error occurred. API response was : "(' + response.status + ')"');
		});
	}
});		// status-page controller ends


// controller for loading a about-page
app.controller("aboutController", function ($scope, $http) {
	var sideNavDiv = document.getElementsByClassName("sidenav")[0];
	var mainDiv = document.getElementsByClassName("main")[0];
	if (sideNavDiv['className'] == "sidenav sidenav_small") 
		angular.element(mainDiv).addClass("main_big");
	else
		angular.element(mainDiv).removeClass("main_big");

});





