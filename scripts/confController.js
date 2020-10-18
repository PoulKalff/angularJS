// controller for loading a config-page
app.controller('configController', function($scope, $cookies, $http) {
	var sideNavDiv = document.getElementsByClassName("sidenav")[0];
	var mainDiv = document.getElementsByClassName("main")[0];
	if (sideNavDiv['className'] == "sidenav sidenav_small") 
		angular.element(mainDiv).addClass("main_big");
	else
		angular.element(mainDiv).removeClass("main_big");

	$scope.selectedTab = 'static/templates/conf_tab0.html';

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


	// selects a tab on the page
	$scope.selectTab = function(nr) {
		$scope.selectedTab = 'static/templates/conf_tab' + nr + '.html';
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
			.then(function (reply) { $scope.dvrConfig = reply.data.entries[0].uuid; })
	}
	// chainload all configs
	$http.get("/api/dvr/config/grid")
		.then(function (reply) { $scope.configBasic = reply.data.entries });
	// Tab 2
	$http.get("/api/access/entry/grid")
		.then(function (reply) { $scope.configUsers = reply.data.entries });
	$http.get("/api/passwd/entry/grid")
		.then(function (reply) { $scope.configPasswords = reply.data.entries });
	$http.get("/api/ipblock/entry/grid")
		.then(function (reply) { $scope.configIpblocks = reply.data.entries });
	// Tab 3
	$http.post('/api/hardware/tree', http_build_query({ 'uuid': 'root'}), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
		.then(function (reply) { $scope.tvAdapters = reply.data }, function (reply) { alert('Something went awry...'); });
	$http.get("/api/mpegts/network/grid")
		.then(function (reply) { $scope.dvbNetworks = reply.data.entries });
	$http.get("/api/mpegts/mux/grid?limit=256")
		.then(function (reply) { $scope.muxes = reply.data.entries });
	$http.get("/api/mpegts/service/grid?limit=256")
		.then(function (reply) { $scope.services = reply.data.entries });
	$http.get("/api/mpegts/mux_sched/grid")
		.then(function (reply) { $scope.schedulers = reply.data.entries });
	// Tab 4
	$http.get("/api/channel/grid?limit=256")
		.then(function (reply) { $scope.channels = reply.data.entries });
	$http.get("/api/channeltag/grid")
		.then(function (reply) { $scope.channelTags = reply.data.entries });
	$http.get("/api/bouquet/grid")
		.then(function (reply) { $scope.bouquets = reply.data.entries });
	$http.get("/api/epggrab/channel/grid")
		.then(function (reply) { $scope.grabberChannels = reply.data.entries });
	$http.get("/api/epggrab/module/list")
		.then(function (reply) { $scope.grabberModules = reply.data.entries });
	$http.get("/api/epggrab/config/load")
		.then(function (reply) { $scope.grabberConfig = reply.data.entries[0].params });
	// Tab 5
	$http.get("/api/profile/list")
		.then(function (reply) { $scope.streamProfiles = reply.data.entries });
	$http.get("/api/codec_profile/list")
		.then(function (reply) { $scope.codecProfiles = reply.data.entries });
	$scope.streamFilters = [];
	angular.forEach(['video', 'audio', 'teletext', 'subtit', 'ca', 'other'], function(value) 
	{
		$http.get("/api/esfilter/" + value + "/grid")
			.then(function (reply) { 
				angular.forEach( reply.data.entries, value2 => { 
					value2['filterType'] = value;
					$scope.streamFilters.push(value2) 
				});
			});
	});
	// Tab 6
	$http.get("/api/dvr/config/grid")
		.then(function (reply) { $scope.configProfiles = reply.data.entries });
	$http.get("/api/timeshift/config/load")
		.then(function (reply) { $scope.timeshiftConfig = reply.data.entries[0].params });
	// Tab 7
	$http.get("/api/caclient/list")
		.then(function (reply) { $scope.caClients = reply.data.entries });
	// Tab 8
	$http.get("/api/tvhlog/config/load")
		.then(function (reply) { $scope.logConfig = reply.data.entries[0].params });
	}); // controller ends




