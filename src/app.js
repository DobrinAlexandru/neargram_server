var express = require('express');
var fetchUrl = require("fetch").fetchUrl;
var geolib = require('geolib');
var Promise = require("bluebird");
var firebase =  require('firebase');
var _ = require('lodash');
var fs = require('fs');



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
        console.log(req.query.userID);
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
app.post('/topPosts', function(req, res) {
  // var locations = req.body.locations;
  var userID = req.body.userID;
  console.log(userID);
   firebase.database().ref(`/user/`+ userID + `/albums`).on('value', snapshot => {
        console.log("AAAAAAAAAAAAAAAAAA");
        // this.setState({ refreshing: false });
        if(snapshot.val() != null){
          // console.log(snapshot.val());
          // Mixpanel.track("Load albums");
          var newAlbums = [];
          _.forEach(snapshot.val(), (album) => {
            var albumsFromDB = album.albums;
            for(var i = 0; i < albumsFromDB.length; i++){
                  if(albumsFromDB[i] != null){
                if(albumsFromDB[i] != null && albumsFromDB[i].profile){
                  albumsFromDB[i].profile.media.nodes = albumsFromDB[i].profile.media.nodes.slice(0,9);//TODO
                }
                if(albumsFromDB[i].likes.count > 0){
                  newAlbums.push(albumsFromDB[i]);
                }
            }
          }
          });
          for(var i = 0; i < newAlbums.length - 1; i++ ){
            for(var j = i + 1; j < newAlbums.length; j++){
              if(newAlbums[i].likes.count < newAlbums[j].likes.count){
                var album = newAlbums[i];
                newAlbums[i] = newAlbums[j];
                newAlbums[j] = album;
              }
            }
          }
          newAlbums = newAlbums.slice(0, 40);
          // console.log(newAlbums);
          res.end(JSON.stringify(newAlbums));
        }
    });
});

app.post('/trending', function(req, res) {
  // var locations = req.body.locations;
  var userID = req.body.userID;
  console.log(userID);
   firebase.database().ref(`/user/`+ userID + `/albums`).on('value', snapshot => {
        console.log("trending");

        if(snapshot.val() != null){
          // console.log(snapshot.val());
          // Mixpanel.track("Load albums");
          var newAlbums = [];

          _.forEach(snapshot.val(), (album) => {
            var albumsFromDB = album.albums;
            for(var i = 0; i < albumsFromDB.length; i++){
              if(albumsFromDB[i] != null){
                if(albumsFromDB[i] != null && albumsFromDB[i].profile){
                  albumsFromDB[i].profile.media.nodes = albumsFromDB[i].profile.media.nodes.slice(0,9);//TODO
                }
                var diff = Date.now()/1000 - albumsFromDB[i].date;

                if(diff > -14400 && diff < 14400){
                  newAlbums.push(albumsFromDB[i]);
                }
              }
            }
          });
          for(var i = 0; i < newAlbums.length - 1; i++ ){
            for(var j = i + 1; j < newAlbums.length; j++){

              if(newAlbums[i].likes.count < newAlbums[j].likes.count){
                var album = newAlbums[i];
                newAlbums[i] = newAlbums[j];
                newAlbums[j] = album;
              }
            }
          }
          newAlbums = newAlbums.slice(0, newAlbums.length/3);
          // this.setState({ albums: newAlbums });
          res.end(JSON.stringify(newAlbums));
        }
    });
})

app.post('/placefeed', function(req, res) {
  // var locations = req.body.locations;
  var userID = req.body.userID;
  console.log(userID);
   firebase.database().ref(`/user/`+ userID + `/albums`).on('value', snapshot => {
        console.log("trending");

        if(snapshot.val() != null){
          // console.log(snapshot.val());
          // Mixpanel.track("Load albums");
          var newAlbums = [];

          _.forEach(snapshot.val(), (album) => {
            var albumsFromDB = album.albums;
            for(var i = 0; i < albumsFromDB.length; i++){
              if(albumsFromDB[i] != null){
                if(albumsFromDB[i] != null && albumsFromDB[i].profile){
                  albumsFromDB[i].profile.media.nodes = albumsFromDB[i].profile.media.nodes.slice(0,9);//TODO
                }
                var diff = Date.now()/1000 - albumsFromDB[i].date;

                if(diff > -14400 && diff < 14400){
                  newAlbums.push(albumsFromDB[i]);
                }
              }
            }
          });

          // newAlbums = newAlbums.slice(0, newAlbums.length/3);
          // this.setState({ albums: newAlbums });
          res.end(JSON.stringify(newAlbums));
        }
    });
});

app.post('/locations', function(req, res) {
  var locations = req.body.locations;
  var userID = req.body.userID;
  console.log(userID);

  processLocations(res, locations, userID);
});

app.get('/locations', function(req, res) {
  // var locations = req.body.locations;
  // var userID = req.body.userID;
  // console.log(userID);
        // firebase.database().ref('/user/887280524749095/locations')
   //    .once('value', snapshot => {
   //      if(snapshot.val() == null){
   //        console.log("firebase locations not found");
   //      } else {
   //        console.log("firebase locations exist");
   //      }
   //     });

  // DUmmy data 
  // var locations = []; var location = {} ; location.id = "330910823", location.name = "cismigiu"; location.time = Date.now();
  // location.latitude = 44.436132; location.longitude =  26.092335;
  // locations.push(location);
  // locations.push(location);
  var userID = "887280524749095";
  // firebase.database().ref(`/user/`+ userID + `/albums`).on('value', snapshot => {
  //       console.log("AAAAAAAAAAAAAAAAAA");
  //       // this.setState({ refreshing: false });
  //       if(snapshot.val() != null){
  //         console.log(snapshot.val());
  //         // Mixpanel.track("Load albums");
  //         var newAlbums = [];
  //         _.forEach(snapshot.val(), (album) => {
  //           var albumsFromDB = album.albums;
  //           for(var i = 0; i < albumsFromDB.length; i++){
  //                 if(albumsFromDB[i] != null){
  //               if(albumsFromDB[i] != null && albumsFromDB[i].profile){
  //                 albumsFromDB[i].profile.media.nodes = albumsFromDB[i].profile.media.nodes.slice(0,9);//TODO
  //               }
  //               if(albumsFromDB[i].likes.count > 0){
  //                 newAlbums.push(albumsFromDB[i]);
  //               }
  //           }
  //         }
  //         });
  //         for(var i = 0; i < newAlbums.length - 1; i++ ){
  //           for(var j = i + 1; j < newAlbums.length; j++){
  //             if(newAlbums[i].likes.count < newAlbums[j].likes.count){
  //               var album = newAlbums[i];
  //               newAlbums[i] = newAlbums[j];
  //               newAlbums[j] = album;
  //             }
  //           }
  //         }
  //         newAlbums = newAlbums.slice(0, 10);
  //         console.log(newAlbums);
  //         res.end(JSON.stringify(newAlbums));
  //       }
  //   });


  // console.log(locations.length);
  // // res.end(JSON.stringify(locations));

  //  processLocations(res, locations, userID);
 //   fetchUrl('https://www.facebook.com/pages/Gr%C4%83dina-Verona/183608628352209', function(error, meta, body){
 //              // console.log(body.toString());
 // //                   var el=  body.getElementById("vertex_feed_container");

 // //                   // var regExString = new RegExp("(?:"+"vertex_feed_container"+")(.*?)(?:"+";code"+")", "ig");
 // //                   // var testRE = regExString.exec(str);
 // //                   // var test = str.startsWith("script");
 // //                   console.log(el.toString());
 //             var wstream = fs.createWriteStream('myOutput.txt');
        // wstream.write(body.toString());
 //              res.end('hello');

 //   });
});
function processLocations2(res, locations, userID){


}
function processLocations(res, locations, userID){
        var promises = [];
        console.log("location length" + locations.length);
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

        var userPromises = [];
        console.log("albums before fetch user" + albums.length);

        for(var i = 0; i < albums.length; i++){
                userPromises.push(fetchUser(albums[i]));
        }

        res.end("hello");
                // firebase.database().ref(`/user/`+ userID + `/albums`).remove();
            //  firebase.database().ref(`/user/`+ userID + `/albums`).push({ albums });

        return Promise.all(userPromises).then(function(albumsWithUsers){
                console.log("albums with users length" + JSON.stringify(albumsWithUsers.length));
                var albums = [];

                    for(var i = 0; i < albumsWithUsers.length; i++){
                        albums.push(albumsWithUsers[i]);

                }


                return Promise.resolve(albums);

        }).bind(this).then(function(albums){
                // console.log("albums");
                // console.log(albums);

                var profilePromises = [];
                for(var i = 0; i < albums.length; i++){
                        if(albums[i].user != null)
                                                profilePromises.push(fetchProfile(albums[i]));
                        }

                return Promise.all(profilePromises).then(function(albumsWithUsersAndProfile){
                        console.log("albums with profile length" + JSON.stringify(albumsWithUsersAndProfile.length));
                        var albums = [];

                            for(var i = 0; i < albumsWithUsersAndProfile.length; i++){
                                albums.push(albumsWithUsersAndProfile[i]);

                        }
                        console.log("albums profile length" + albums.length);
                        console.log("userID" + userID);
                        firebase.database().ref(`/user/`+ userID + `/albums`).remove();
                          firebase.database().ref(`/user/`+ userID + `/albums`).push({ albums });
              firebase.database().ref(`/user/`+ userID + `/update`).remove();
              var aa= albums.length;
                firebase.database().ref(`/user/`+ userID + `/update`).push({ aa });
                        }).bind(this);
        });


        });
  }
function fetchUser(post){
        return new Promise(function(resolve, reject) {
        fetchUrl('https://www.instagram.com/p/'+ post.code, function(error, meta, body){
                 // console.log(body.toString());

                           var content = body.toString();
                           var str = content;
                       var regExString = new RegExp("(?:"+"window._sharedData = "+")(.*?)(?:"+";</script>"+")", "ig");
                       var testRE = regExString.exec(str);

                          if(testRE != null && testRE.length > 1) {
                                  var jsonData = JSON.parse(testRE[1]);
                       if(jsonData.entry_data.PostPage != null){
                         var data = jsonData.entry_data.PostPage[0].graphql.shortcode_media.owner;
                       //  console.log(data);
                        post.user = data;
                         return resolve(post);
                     } else {
                       return resolve(post);
                     }
                        } else {
                                return resolve({});
                        }
                });
    }).bind(this);
  }

  function fetchProfile(album){
                console.log(album.user.username);
                return new Promise(function(resolve, reject) {
                fetchUrl('https://www.instagram.com/_u/'+ album.user.username, function(error, meta, body){
                        //  console.log(body.toString());

                                   var content = body.toString();
                                   var str = content;
                               var regExString = new RegExp("(?:"+"window._sharedData = "+")(.*?)(?:"+";</script>"+")", "ig");
                               var testRE = regExString.exec(str);
                             if(testRE != null && testRE.length > 0){
                               var jsonData = JSON.parse(testRE[1]);

                                            if(jsonData.entry_data.ProfilePage != null){
                                                 var data = jsonData.entry_data.ProfilePage[0].user;
                                                 // console.log(data);
                                                 album.profile = data;
                                                 return resolve(album);
                                            } else {
                                               return resolve(album);
                                            }
                                } else {
                                        return resolve({});
                                }
                        });
                 }).bind(this);
  }

  function fetchData(location){

     return new Promise(function(resolve, reject) {
        fetchUrl('https://www.instagram.com/explore/locations/'+ location.id, function(error, meta, body){
                         // console.log(body.toString());

                           var content = body.toString();
                           var str = content;
                       var regExString = new RegExp("(?:"+"window._sharedData = "+")(.*?)(?:"+";</script>"+")", "ig");
                       var testRE = regExString.exec(str);
                       if(testRE != null && testRE.length >= 1) {
                       var jsonData = JSON.parse(testRE[1]);
                        //    console.log(jsonData.entry_data.LocationsPage);
                       if(jsonData.entry_data.LocationsPage != null){
                         var data = jsonData.entry_data.LocationsPage[0].location.media.nodes;
                         var topPosts = jsonData.entry_data.LocationsPage[0].location.top_posts.nodes;
                         var lat = jsonData.entry_data.LocationsPage[0].location.lat;
                         var lng = jsonData.entry_data.LocationsPage[0].location.lng;
                         var hash = [];
                         var result = [];
                        // console.log(JSON.stringify(topPosts));
                         var distance = geolib.getDistance(
                           {latitude: location.latitude, longitude: location.longitude},
                           {latitude: lat , longitude: lng }
                         );

                         console.log("data each length" + data.length);
                         for(var i = 0;  i < data.length; i++){ //TODO
                            var diff = location.time/1000 - data[i].date;
                            if((diff > - 144000  && diff < 144000)  && hash[data[i].code] != true  && data[i].likes.count > 0) { // post in the last 2h hours and filter them again by distance in order to check if the place has the right location
                              data[i].name = location.name;
                              data[i].distance = distance;
                              result.push(data[i]);
                              hash[data[i].code] = true;
                            }
                         }

                         for(var i = 0; i < topPosts.length; i++){
                          var diff = location.time/1000 - topPosts[i].date;
                           if(hash[topPosts[i].code] != true &&  (diff > - 144000 && diff < 144000)  && topPosts[i].likes.count > 0) {
                             topPosts[i].name = location.name;
                             topPosts[i].distance = distance;
                             hash[topPosts[i].code] = true;
                             result.push(topPosts[i]);
                           }
                         }
                         console.log("album each length" + result.length);
                         return resolve(result);
                     } else {
                       return resolve([]);
                     }
                        } else {
                                return resolve([]);
                        }
                });
    }).bind(this);
}

// Listen
var port = 3000;
app.listen(port);
