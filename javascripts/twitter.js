<!-- <script src="javascripts/codebird.js"></script> -->
<!-- <script src="//openlayers.org/api/OpenLayers.js"></script> -->

var tweetsCollection = new Firebase('https://glaring-fire-1184.firebaseio.com/tweets'),
  tweetsLength,
  knownTweets;

var tweetsListener = function(){
  getTweets();
  tweetsCollection.on('value', function(snapshot){
    knownTweets = snapshot.val();
    if (knownTweets) {
      tweetsLength = knownTweets.length;
      console.log("tweets: " + knownTweets.length);
      drawTweetCircles(knownTweets);
    }
  });
  // tweetsCollection.on('child_removed',function(snapshot){
  //   console.log(snapshot.val());
    
  //   tweetsListener();
  // });
};

var getTweets = function(){
	var cb = new Codebird;

	cb.setConsumerKey("", "");
	cb.__call("oauth2_token", {}, function(reply){
	  var bearer_token = reply.access_token;
	});

	var	params = { q: "California Drought", count: 100 },
		results
	
	cb.__call("search_tweets", params, function(reply){
    results = reply;
console.log("ALL TWEETS:")
console.log(results);
		getGeoTweets(results);
  });
};

var getGeoTweets = function(results){
	var tweets = [];
	for (var i = 0; i < results.statuses.length; i++){
		if (results.statuses[i].coordinates){
			tweets.push(results.statuses[i]);
		};
	};
console.log("GEO TWEETS: ");
console.log(tweets);
	getGeoTweetsInCalifornia(tweets)
};

var getGeoTweetsInCalifornia = function(tweets){
	var longitude,
		latitude,
		geoTweet = {};

	for (var i = 0; i < tweets.length; i++){
		longitude = tweets[i].coordinates.coordinates[0];
		latitude = tweets[i].coordinates.coordinates[1];

		var parser = new OpenLayers.Format.GeoJSON(),
			vectors = parser.read(californiaBoundaryGeometry),
			point = new OpenLayers.Geometry.Point(longitude, latitude);
console.log("CHECKING IF IN CALI");
console.log(point);
		
    for (var i = 0; i < vectors.length; i++){
	    
      if(vectors[i].geometry.intersects(point)){
console.log("CALI TWEETS: ");
console.log(geoTweet);
				geoTweet.location = {};
	      geoTweet.location.longitude = longitude;
	      geoTweet.location.latitude = latitude;
	      geoTweet.text = tweets[i].text;
        geoTweet.username = tweets[i].user.screen_name
        geoTweet.status_id = tweets[i].entities.id
        geoTweet.user_id = tweets[i].user.id
        
        if (knownTweets){
          for (var i = 0; i < knownTweets.length; i++){
            if (knownTweets[i].location.latitude === geoTweet.location.latitude && 
              knownTweets[i].location.longitude === geoTweet.location.longitude){
console.log("NOT unique!");
            } else {
console.log("UNIQUE FOUND!");
              tweetsCollection.child(tweetsLength || 0).set(geoTweet);
            }
          }
        }
	    } else {
        console.log("NOT IN CALI");
      }
		};
	};
};

function drawTweetCircles(tweets){
  svg.selectAll(".tweet-dot")
    .data(tweets).exit()
  
    .transition().duration(300)
    .attr("r", 0)
    .remove();

  svg.selectAll(".tweet-dot")
    .data(tweets).enter()

    .append("circle")
      .transition().ease("elastic")
      .attr("r", 0)
      .attr("transform", function(d){
        return "translate(" + projection([
          d.location.longitude,
          d.location.latitude
        ]) + ")"
      })
      .attr("class", "tweet-dot")
      .transition().duration(750).ease("bounce")
      .attr("r", dotRadius)
      .attr("cursor", "pointer")
};
