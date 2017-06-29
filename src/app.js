var express = require('express');
var fetchUrl = require("fetch").fetchUrl;
var geolib = require('geolib');
var Promise = require("bluebird");
var firebase =  require('firebase');
var bodyParser = require('body-parser');
var _ = require('lodash');
var rp = require('request-promise');
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
// app.use(express.urlencoded()); app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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

app.post('/byLocation', function(req, res) {
  // var locations = req.body.locations;
  var userID = req.body.userID;
  var locationName = req.body.locationName;
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
                if(albumsFromDB[i].likes.count > 0 && albumsFromDB[i].name == locationName){
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
          // newAlbums = newAlbums.slice(0, 10);
          // console.log(newAlbums);
          res.end(JSON.stringify(newAlbums));
        }
    });
});

app.post('/topPosts', function(req, res) {
  // var locations = req.body.locations;
  var userID = req.body.userID;
  console.log(userID);
   firebase.database().ref(`/user/`+ userID + `/albums`).on('value', snapshot => {
        // console.log("AAAAAAAAAAAAAAAAAA");
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
          newAlbums = newAlbums.slice(0, 10);
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
        // console.log("trending");

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
        // console.log("trending");

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

                if(diff > -14000 && diff < 14000){
                  newAlbums.push(albumsFromDB[i]);
                }
              }
            }
          });

          // newAlbums = newAlbums.slice(0, 200);
          // this.setState({ albums: newAlbums });
          res.end(JSON.stringify(newAlbums));
        }
    });
});

app.post('/locations', function(req, res) {
  var locations = req.body.locations;
  var userID = req.body.userID;
  var removeData = req.body.removeData;
  var stopLoadingView = req.body.stopLoadingView;
  var stopLoadingViewAllData =  req.body.stopLoadingViewAllData;
  console.log(userID);
  console.log("stop loading" + stopLoadingView);
  console.log("stop loading all data" + stopLoadingViewAllData);
  processLocations(res, locations, userID, removeData, stopLoadingView, stopLoadingViewAllData);
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
function sendNotification(userID){
  var options = {
      method: 'POST',
      uri: 'https://fcm.googleapis.com/fcm/send',
      headers: {
        'Authorization': 'key=AAAAwe5Y5Kw:APA91bEGwt_wfC6tOakRCDahCphOTjQzzLVm1_2vVCe6no5EFNy-Y86pG7JIImCSvOovU9xl9Ib5jP2y_UD17JVF3b87o8Gpsdf1grTYp9anmBvA5D0VhqydzCNEx3KFkzjRbJaAPueO',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "to":"/topics/" + userID,
        "content_available": true,
        "notification": {
           "title": "Neargram",
           "body": "Feed loaded. Enter to see nearby posts",
           "alert": "yo",
           "msg": "msg",
           "click_action": "fcm.ACTION.HELLO"
        },
         "data": {
            "extra":"juice"
        }})
    };
  rp(options);
}
function processLocations(res, locations, userID, removeData, stopLoadingView, stopLoadingViewAllData){
        var promises = [];
        console.log("location length" + locations.length);
        for(var i = 0 ; i < locations.length; i++){
                promises.push(fetchData(locations[i]).bind(this))
        }
    var t1 = Date.now();
    Promise.all(promises)
    .then(function(allData) {
        var albums = [];
        var hash = [];
        var t2 = Date.now();
        console.log("time to fetch data" + (t2 - t1));
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

        return Promise.all(userPromises).then(function(albumsWithUsers){
                console.log("albums with users length" + JSON.stringify(albumsWithUsers.length));
                var albums = [];

                    for(var i = 0; i < albumsWithUsers.length; i++){
                        albums.push(albumsWithUsers[i]);

                }
                var t3 = Date.now();
                console.log("time till fetch2:" + (t3 - t1));
                return Promise.resolve(albums);

        }).bind(this).then(function(albums){
                // console.log("albums");
                // console.log(albums);

              var profilePromises = [];
              for(var i = 0; i < albums.length; i++){
                      var mark = [];
                      if(albums[i].user != null &&  mark[albums[i].user.username] != true){
                          mark[albums[i].user.username] =  true;
                         profilePromises.push(fetchProfile(albums[i]));
                       }
              }

              return Promise.all(profilePromises).then(function(albumsWithUsersAndProfile){
                      console.log("albums with profile length" + JSON.stringify(albumsWithUsersAndProfile.length));
                      var albums = [];

                          for(var i = 0; i < albumsWithUsersAndProfile.length; i++){
                              albums.push(albumsWithUsersAndProfile[i]);

                      }
                      console.log("p -albums profile length" + albums.length);
                      console.log("p- userID" + userID);
                      console.log("p- remove data" + removeData);
                      console.log("p- stopLoadingView" + stopLoadingView);
                      if(removeData == true || removeData == "true"){
                        firebase.database().ref(`/user/`+ userID + `/albums`).remove();
                        
                        firebase.database().ref(`/user/`+ userID + `/loadingState`).remove();
                        var aa = true;
                        firebase.database().ref(`/user/`+ userID + `/loadingState`).push({ aa });
                        firebase.database().ref(`/user/`+ userID + `/loadingStateAllData`).remove();
                        firebase.database().ref(`/user/`+ userID + `/loadingStateAllData`).push({ aa });
                      }

                      if(stopLoadingView == true || stopLoadingView == "true"){
                        firebase.database().ref(`/user/`+ userID + `/loadingState`).remove();
                        var aa = false;
                        firebase.database().ref(`/user/`+ userID + `/loadingState`).push({ aa });
                        firebase.database().ref(`/user/`+ userID + `/update`).remove();
                        var aaa = albums.length;
                        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBCCCCCCCCCCCCCCCCCC")
                        firebase.database().ref(`/user/`+ userID + `/update`).push({ aaa });
                      }
                       
                      if(stopLoadingViewAllData == true || stopLoadingViewAllData == "true"){
                        firebase.database().ref(`/user/`+ userID + `/loadingStateAllData`).remove();
                        var aa = false;
                        firebase.database().ref(`/user/`+ userID + `/loadingStateAllData`).push({ aa });
                        firebase.database().ref(`/user/`+ userID + `/update`).remove();
                        var aaa= Date.now();
                        console.log("ENDDDDDDDDDDDDDDDDDDDDDDDDDDD")
                        firebase.database().ref(`/user/`+ userID + `/update`).push({ aaa });
                        sendNotification(userID);
                      }
                      firebase.database().ref(`/user/`+ userID + `/albums`).push({ albums });
                      var t4 = Date.now();
                      console.log("time to fetch3: " + (t4 - t1));
                    
            }).bind(this);
        });


        });
  }
function fetchUser(post){
  return new Promise(function(resolve, reject) {
    fetchUrl('https://www.instagram.com/p/'+ post.code, function(error, meta, body){
             // console.log(body.toString());
          if(body != null){
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
              } else {
                 return resolve({});
              }
        });
    }).bind(this);
  }
function fetchProfile(album){
                // console.log(album.user.username);
                return new Promise(function(resolve, reject) {
              fetchUrl('https://www.instagram.com/_u/'+ album.user.username, function(error, meta, body){
                      //  console.log(body.toString());
                        if(body != null){
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
                                                 // album.profile.media.nodes = album.profile.media.nodes.slice(0,9);//TODO
                                               return resolve(album);
                                          } else {
                                             return resolve(album);
                                          }
                              } else {
                                      return resolve({});
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
                        var distance = 0 ;
                        if(location == null || lat == null || lng == null){

                        } else {
                          distance = geolib.getDistance(
                           {latitude: location.latitude, longitude: location.longitude},
                           {latitude: lat , longitude: lng }
                         );
                        }
                          

                         // console.log("data each length" + data.length);
                         for(var i = 0;  i < data.length; i++){ //TODO
                            var diff = location.time/1000 - data[i].date;
                            if((diff > - 14000  && diff < 14000)  && hash[data[i].code] != true  && data[i].likes.count > 0) { // post in the last 2h hours and filter them again by distance in order to check if the place has the right location
                              data[i].name = location.name;
                              data[i].distance = distance;
                              result.push(data[i]);
                              hash[data[i].code] = true;
                            }
                         }

                         for(var i = 0; i < topPosts.length; i++){
                          var diff = location.time/1000 - topPosts[i].date;
                           if(hash[topPosts[i].code] != true &&  (diff > - 14000 && diff < 42000)  && topPosts[i].likes.count > 0) {
                             topPosts[i].name = location.name;
                             topPosts[i].distance = distance;
                             hash[topPosts[i].code] = true;
                             result.push(topPosts[i]);
                           }
                         }
                         // console.log("album each length" + result.length);
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

var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});