'use strict';

angular.module('cloudoptingApp')
		.directive('onLastRepeat', function() {
			return function(scope, element, attrs) {
				if (scope.$last)
					setTimeout(function() {
						scope.$emit('onRepeatLast', element, attrs);
						console.log("emitting");
						console.log(element);
					}, 1);
			};
		})
		.controller( 'MonitoringController', function(SERVICE, localStorageService,
													  $scope, $state, $log, $timeout, $translate,
													  MonitoringService, Principal) {

					var instance = localStorageService.get(SERVICE.STORAGE.MONITORING.INSTANCE);
					var activationDate = instance.customizationActivation;
					console.log(activationDate);
					$scope.dater = {
						startDate : moment(activationDate, "YYYY-MM-DD"),
						endDate : moment()
					}
					// Add the dives to the page dynamically.
					$scope.graphsList = [];

					$scope.zabbixgraph = {
						data : null,
						labels : null,
						xkey : 'clock',
						ykeys : 'value',
						lineColors : [ 'green' ],
						postUnits : null,
					// dateFormat: function(x){return new
					// Date(x*1000).toString();}
					};

					$scope.zabbixdata = {
						hostSelect : null,
						hostOptions : null,
						itemsSelect : null,
						itemsOptions : null,
						chartData : null
					};

					// Get all the zabbix hosts depending on the instance.
					var zabbixHostCallback = function(data, status, headers,
							config) {
						checkStatusCallback(data, status, headers, config);
						if (data) {
							$scope.zabbixdata.hostOptions = angular
									.fromJson(data);
						}
					};
					MonitoringService.findAllZabbixHosts(instance.id,
							zabbixHostCallback);

					// Update all zabbix items depending on the host
					$scope.updateItems = function(hostid) {
						var zabbixItemsCallback = function(data, status,
								headers, config) {
							checkStatusCallback(data, status, headers, config);
							if (data) {
								$scope.zabbixdata.itemsOptions = angular
										.fromJson(data);
							}
						};
						console.log(hostid);
						MonitoringService.findAllZabbixItems(instance.id,
								hostid, zabbixItemsCallback);
					};

					// Update the chart depending on the zabbix item
					$scope.updateChart = function(itemid) {
						var zabbixHistoryCallback = function(data, status,
								headers, config) {
							checkStatusCallback(data, status, headers, config);
							var propsToConvert = {
								clock : 1,
								value : 1
							};
							if (data) {
								// $scope.zabbixdata.chartData =
								// angular.fromJson(data);
								// console.log($scope.zabbixdata.chartData);
								/*
								 * $scope.zabbixgraph.data = JSON.parse(data,
								 * function(key, value){
								 * if(propsToConvert.hasOwnProperty(key)){
								 * return parseInt(value, 10); } return value;
								 * });
								 */
								console.log($scope.zabbixdata.itemsSelect);
								$scope.zabbixgraph.data = angular
										.fromJson(data);
								$scope.zabbixgraph.labels = [ $scope.zabbixdata.itemsSelect.name ];
								$scope.zabbixGraphTitle = $scope.zabbixdata.itemsSelect.name;
								$scope.zabbixgraph.postUnits = $scope.zabbixdata.itemsSelect.units;
								console.log($scope.zabbixgraph);
								$timeout(function() {
									$("#itemSelected").empty();
									lineChartZabb($scope.zabbixgraph,
											"itemSelected");
								}, 1000);
							}
						};

						console.log(itemid);
						MonitoringService.findZabbixHistory(instance.id,
								$scope.zabbixdata.hostSelect.hostid, itemid,
								$scope.dater.startDate.unix(),$scope.dater.endDate.unix(),
								zabbixHistoryCallback);
					};

					$scope.changeDate = function() {
						console.log("in changeDate");
						console.log($scope.dater);
						MonitoringService.findOneDataById(instance.id,
								$scope.dater.startDate.format("YYYY-MM-DDThh:mm:ssZ"), $scope.dater.endDate.format("YYYY-MM-DDThh:mm:ssZ"),
								elasticcallback);
					}

					var elasticcallback = function(data, status, headers,
							config) {
						checkStatusCallback(data, status, headers, config);
						if (data) {
							var graphs = data;
							console.log(data);
							$scope.graphsList = [];
							for ( var i in graphs) {
								$scope.graphsList.push({
									title : graphs[i].title,
									chartId : "elastic_chart_" + i,
									data : graphs[i]
								});
								/*
								 * $timeout(function () { switch
								 * (graphs[i].type) { case "bar": //
								 * barChart(graphs[i], "elasticchart"+i);
								 * $timeout(function() { barChart(graphs[i],
								 * "elasticchart"+i); }, 1000); break; default:
								 * lineChart(graphs[i], "elasticchart"+i);
								 * break; } }, 1000);
								 */
							}
							console.log("filled data for elastic graphs");
						}
					};
					MonitoringService.findOneDataById(instance.id,
							$scope.dater.startDate.format("YYYY-MM-DDThh:mm:ssZ"), $scope.dater.endDate.format("YYYY-MM-DDThh:mm:ssZ"),
							elasticcallback);

					$scope.$on('onRepeatLast', function(scope, element, attrs) {
						console.log("the ngrepeat has finished");
						for ( var i in $scope.graphsList) {
							console.log(i);
							console.log("elastic_chart_" + i);
							// $timeout(function() {
							console.log("creating bar chart" + i);
							barChart($scope.graphsList[i].data,
									"elastic_chart_" + i);
							// }, 1000);
						}
					});
					// FIXME: TO DELETE: "HARDCODED" to 1.
					/*
					 * var newelasticcallback = function(data, status, headers,
					 * config) { checkStatusCallback(data, status, headers,
					 * config); if(data) { var graph = data;
					 * $scope.graphsList.push({ title: "New Elastic Chart Line
					 * (ID:1)", chartId: "newelasticchart_line" });
					 * $scope.graphsList.push({ title: "New Elastic Chart Bar
					 * (ID:1)", chartId: "newelasticchart_bar" });
					 * $timeout(function () { lineChart(graph,
					 * "newelasticchart_line"); barChart(graph,
					 * "newelasticchart_bar"); }, 1000); } };
					 * MonitoringService.findByCustomizationId(1,newelasticcallback);
					 */

					var lineChartZabb = function(graph, chart_name) {
						new Morris.Line({
							element : chart_name,
							data : graph.data,
							xkey : 'clock',
							ykeys : [ 'value' ],
							labels : graph.labels,
							postUnits : graph.postUnits,
							lineColors : graph.lineColors,
							dateFormat : function(x) {
								return new Date(x).toString();
							}
						});
					};

					var lineChart = function(graph, chart_name) {
						new Morris.Line({
							element : chart_name,
							data : graph.data,
							xkey : graph.xkey,
							ykeys : graph.ykeys,
							labels : graph.labels,
							lineColors : graph.lineColors
						});
					};

					var barChart = function(graph, chart_name) {
						new Morris.Bar({
							element : chart_name,
							data : graph.data,
							xkey : graph.xkey,
							ykeys : graph.ykeys,
							labels : graph.labels,
							barColors : graph.lineColors
						});
					};

					/*
					 * 
					 * /////////////// // CHART EXAMPLE ///////////////
					 * 
					 * new Morris.Bar({ // ID of the element in which to draw
					 * the chart. element: 'Example Chart Name', // Chart data
					 * records -- each entry in this array corresponds to a
					 * point on the chart. data: [ { time: '2001', disk: 20,
					 * cpu: 12, ram: 15 }, { time: '2002', disk: 10, cpu: 5,
					 * ram: 13 }, { time: '2003', disk: 5, cpu: 20, ram: 19 }, {
					 * time: '2004', disk: 5, cpu: 3, ram: 0 }, { time: '2005',
					 * disk: 20, cpu: 10, ram: 5 } ], // The name of the data
					 * record attribute that contains x-values. xkey: 'time', //
					 * A list of names of data record attributes that contain
					 * y-values. ykeys: ['disk', 'cpu', 'ram'], // Labels for
					 * the ykeys -- will be displayed when you hover over the
					 * chart. labels: ['Disk', 'CPU', 'RAM'], barColors:
					 * ['green', 'blue', 'orange'] });
					 */

					// /////////
					// HANDLE ERRORS
					// /////////
					$scope.errorMessage = null;
					$scope.infoMessage = null;

					// function to check possible outputs for the end user
					// information.
					var checkStatusCallback = function(data, status, headers,
							config) {
						$scope.errorMessage = null;
						if (status == 401 || status==403) {
							// Unauthorised. Check if signed in.
							if (Principal.isAuthenticated()) {
								$scope.errorMessage = $translate.instant("callback.no_permissions");
							} else {
								$scope.errorMessage = $translate.instant("callback.session_ended");
								$timeout(function() {
									$state.go('login');
								}, 3000);
							}
						} else if (status != 200 && status != 201) {
							// Show message
							$scope.errorMessage = $translate.instant("callback.generic_error");

						} else {
							$log.info("Successful.");
						}
					};
				});
