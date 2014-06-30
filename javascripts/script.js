		var svgWidth = function(){
			if (window.innerWidth < 615 * 2) {
				return 615 + "px";
			} else {
				return window.innerWidth / 2;
			}
		},
		  svgHeight = window.innerHeight; //700px

		var projection = d3.geo.albers()
			.translate([50, svgHeight/2 - 110])
			.scale([3900])
			.rotate([123,0]);
		    
		var svg = d3.select(".svg-container").append("svg")
	    .attr("width", svgWidth)
	    .attr("height", svgHeight);

		var path = d3.geo.path()
		  .projection(projection);

		var dotRadius = 5,
			tooltip = d3.select(".svg-container").append("div")
    		.attr("id", "tooltip")
    		.attr("class", "shadow-box")
    		.style("opacity", 0);

    queue()
      .defer(d3.json, "https://glaring-fire-1184.firebaseio.com/california-drought-topo.json")
      .await(drawMap);

    function drawMap(error, map){
      svg.selectAll("path")
        .data(topojson.feature(map, map.objects.drought).features).enter()
        
        .append("path")
        	.attr("d", path)
        	.attr("id", function(d){
        		return "dm" + d.id;
        });

        articlesListener(); 
        tweetsListener();
    };

    function drawCircles(articles){
      svg.selectAll(".article-dot")
  	    .data(articles).exit()
  		
    		.transition().duration(300)
    		.attr("r", 0)
    		.remove();

      svg.selectAll(".article-dot")
      	.data(articles).enter()

        .append("circle")
          .attr("r", 0)
          .attr("transform", function(d){
            return "translate(" + projection([
              d.location.longitude,
              d.location.latitude
            ]) + ")"
          })
          .attr("class", "article-dot")
          .transition().duration(750).ease("bounce")
          .attr("r", dotRadius)
          .attr("cursor", "pointer")

        svg.selectAll(".article-dot")
        .on("mouseover", function(d){
  	      d3.select(this)
        		.transition().ease("bounce")
						.attr("r", dotRadius * 2);
					
					tooltip
						//.transition().duration(150)
						.style("opacity", 1)
						.text(d.title)
						.style("left", (d3.event.pageX + 20) + "px")
						.style("top", (d3.event.pageY - 25) + "px");
        })

        .on("mouseout", function(){
        	tooltip
        		.transition().duration(100)
        		.style("opacity", 0);

        	d3.select(this)
        		.transition().duration(150)
        		.attr("r", dotRadius);
        })
        .on("click", function(d){
        	d3.select('header').data(articles)
        		.text(function(){
        			return d.title;
        		});
        	d3.select('article').data(articles)
        		.text(function(){
        			return d.text;
        		});
        });
    }
    
    function removeCircle(articles){
    	console.log(article);
      svg.selectAll(".dot")
  	    .data(articles).exit()
  		
    		.transition().duration(300)
    		.attr("r", 50);
		}
    
    var californiaBoundaryCollection = new Firebase('https://glaring-fire-1184.firebaseio.com/california');

    var californiaBoundaryGeometry;
      californiaBoundaryCollection.once('value', function(snapshot){
        californiaBoundaryGeometry = snapshot.val();
    });

    var articlesCollection = new Firebase('https://glaring-fire-1184.firebaseio.com/articles'),
    	articleLength;

    var articlesListener = function(){
    	var articles;
    	
    	articlesCollection.on('value', function(snapshot){
    		articles = snapshot.val();
        articleLength = articles.length
    		console.log("articles: " + articles.length);
    		
    		drawCircles(articles);
    	});
    	// articlesCollection.on('child_removed',function(snapshot){
    	// 	console.log(snapshot.val());
    		
    	// 	articlesListener();
    	// });
		};

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
			      
            for (var i = 0; i < knownTweets.length; i++){
              if (knownTweets[i].location.latitude === geoTweet.location.latitude && 
                knownTweets[i].location.longitude === geoTweet.location.longitude){
console.log("NOT unique!");
              } else {
console.log("UNIQUE FOUND!");
                tweetsCollection.child(tweetsLength).set(geoTweet);
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