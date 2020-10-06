// controller for loading a config-page
app.controller('configController', function($scope, $cookies, $http) {
	var sideNavDiv = document.getElementsByClassName("sidenav")[0];
	var mainDiv = document.getElementsByClassName("main")[0];
	if (sideNavDiv['className'] == "sidenav sidenav_small") 
		angular.element(mainDiv).addClass("main_big");
	else
		angular.element(mainDiv).removeClass("main_big");


	// write change to cookie
	$scope.noOfEpg_change = function() {
		var noOfEpgValue = document.getElementById('noOfEpg').value;
		$cookies.put('noOfEpgRecordsToGet', noOfEpgValue, { 'expires': $scope.expireDate });
	}


	// write change to cookie
	$scope.dvrConfig_change = function() {
		var prefRecProfileValue = document.getElementById('prefRecProfile').value;
		if (prefRecProfileValue.startsWith('string:')) { prefRecProfileValue = prefRecProfileValue.substring(7); }
		$cookies.put('preferedDvrConfig', prefRecProfileValue, { 'expires': $scope.expireDate });
	}
















	// MAIN: Program starts here
	// get cookies
	var cookieA = $cookies.get('noOfEpgRecordsToGet');
	if (!angular.isDefined(cookieA)) { cookieA = 15; }
	$scope.noOfEpgRecordsToGet = parseInt(cookieA);
	var cookieB = $cookies.get('preferedDvrConfig');
	$scope.dvrConfig = $cookies.get('preferedDvrConfig');
	if (!angular.isDefined($scope.dvrConfig)) { 
		// load first available  config
		$http.get("/api/dvr/config/grid")
			.then(function (reply) 	{ $scope.dvrConfig = reply.data.entries[0].uuid; })
	}
	// get basic configs
	$scope.addRecordingConfigs = {};
	$http.get("/api/dvr/config/grid")
		.then(function (reply)
		{
			angular.forEach(reply.data.entries, function (item) {
				if (item.name == "") { item.name = "(Default profile)" };
				$scope.addRecordingConfigs[item.name] = item.uuid;
			});
		});

	}); // controller ends




