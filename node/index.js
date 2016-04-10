var http = require('http');
var async = require('async');
var request = require("request");
var express = require('express');
var csv = require('csv');

var app = express();



app.get('/bus', function(req, res) {

	res.send("API access point for everything bus related.");

});

/*
	API Access to close public transport stations.
*/
app.get('/bus/close_stations/:currLat/:currLong/:radius', function(req, res) {
	async.parallel([
		function(next) {
			//Get some data here
			request(
				"http://travelplanner.mobiliteit.lu/hafas/query.exe/dot?performLocating=2&tpl=stop2csv&stationProxy=yes &look_maxdist=" +
				req.params.radius + "&look_x=" + req.params.currLong + "&look_y=" +
				req.params.currLat,
				function(error, response, body) {
					next(null, body);
				});
		}
	], function next(err, results) {
		// results is [firstData, secondData]
		var csv2array = results[0].split("\n");
		var response = [];

		for (var i = 0; i < csv2array.length; i++) {
			if (csv2array[i] != "") {
				var split = csv2array[i].split(";");
				var json_data = {}
				response[i] = {
					"id": +split[2],
					"name": split[3],
					"lat": +split[1].replace(",", ".") * Math.pow(10, 6),
					"long": +split[0].replace(",", ".") * Math.pow(10, 6)
				}
			}
		}

		res.send(response);
	});
});

app.listen(1337);
console.log('Listening on port 1337...');
