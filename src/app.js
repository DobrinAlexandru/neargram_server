var express = require('express');
var fetchUrl = require("fetch").fetchUrl;
var geolib = require('geolib');
var Promise = require("bluebird");
var firebase =  require('firebase');
var _ = require('lodash');


var app = express();
var config = {
 apiKey: "AIzaSyCKE9yf548agj0FfOPYe4ybhRgXZ_umsL0",
 authDomain: "neargram-37d1e.firebaseapp.com",
 databaseURL: "https://neargram-37d1e.firebaseio.com",
 projectId: "neargram-37d1e",
 storageBucket: "neargram-37d1e.appspot.com",
 messagingSenderId: "832927491244"
};
firebase.initializeApp(config);

// Routes
app.use(express.bodyParser());

app.get('/history', function(req, res) {
 	console.log(req.query);
	var path = "/user/" + req.query.userID + "/locations";

	 firebase.database().ref(path)
	   .once('value', snapshot => {
	     var locations = [];
	     _.forEach(snapshot.val(), (location) => {
	        // console.log(location.location);
	        if(location != null) {
	          locations.push(location.location);
	        }
	      });
	     	res.end(JSON.stringify(locations));
	    });
});

app.post('/locations', function(req, res) {
  var locations = req.body.locations;
  var userID = req.body.userID;
  console.log(userID);
  processLocations(locations, userID);
});

function processLocations(locations, userID){
  	var promises = [];
  	for(var i = 0 ; i < locations.length; i++){
  		promises.push(fetchData(locations[i]).bind(this))
  	}

    Promise.all(promises)
    .then(function(allData) {
       	var albums = [];
       	var hash = [];

       	for(var i = 0; i < allData.length; i++){
       		for(var j = 0;  j < allData[i].length; j++){
       			if(hash[allData[i][j].code] != true){
       				albums.push(allData[i][j]);
       				hash[allData[i][j].code] = true;
       			}
       		}
       	}

       	for(var i = 0; i < albums.length - 1; i++){
       		for(var j = i + 1; j < albums.length; j++){
       			if(albums[i].date < albums[j].date){
       				var aux = albums[i];
       				albums[i] = albums[j];
       				albums[j] = aux;
       			}
       		}
       	}
       	
       	firebase.database().ref(`/user/`+ userID + `/albums`).remove();
   	    firebase.database().ref(`/user/`+ userID + `/albums`).push({ albums });
	});
  }

  function fetchData(location){
    console.log(location);

     return new Promise(function(resolve, reject) {
        fetchUrl('https://www.instagram.com/explore/locations/'+ location.id, function(error, meta, body){
   		 // console.log(body.toString());

		   	   var content = body.toString();
		   	   var str = content;
		       var regExString = new RegExp("(?:"+"window._sharedData = "+")(.*?)(?:"+";</script>"+")", "ig");
		       var testRE = regExString.exec(str);
		       var jsonData = JSON.parse(testRE[1]);
		    //   console.log(jsonData.entry_data.LocationsPage);
		       if(jsonData.entry_data.LocationsPage != null){
		         var data = jsonData.entry_data.LocationsPage[0].location.media.nodes;
		         var topPosts = jsonData.entry_data.LocationsPage[0].location.top_posts.nodes;
		         var lat = jsonData.entry_data.LocationsPage[0].location.lat;
		         var lng = jsonData.entry_data.LocationsPage[0].location.lng;
		         var hash = [];
		         var result = [];
		         var distance = geolib.getDistance(
		           {latitude: location.latitude, longitude: location.longitude},
		           {latitude: lat , longitude: lng }
		         );

		         // console.log(data);
		         for(var i = 0;  i < data.length; i++){ //TODO
		            var diff = location.time/1000 - data[i].date;
		            if((diff > - 7200  && diff < 7200)  && hash[data[i].code] != true && distance < 1000) { // post in the last 2h hours and filter them again by distance in order to check if the place has the right location
		              data[i].name = location.name;
		              data[i].distance = distance;
		              result.push(data[i]);
		              hash[data[i].code] = true;
		            }
		         }

		         for(var i = 0; i < topPosts.length; i++){
		          var diff = location.time/1000 - topPosts[i].date;
		           if(hash[topPosts[i].code] != true &&  (diff > - 7200 && diff < 7200) && distance < 1000) {
		             topPosts[i].name = location.name;
		             topPosts[i].distance = distance;
		             hash[topPosts[i].code] = true;
		             result.push(topPosts[i]);
		           }
		         }
		         return resolve(result);
		     } else {
		       return resolve([]);
		     }
		});
    }).bind(this);
}

// Listen
var port = 3000;
app.listen(port);
console.log('Listening on localhost:'+ port);