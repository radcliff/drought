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
  .defer(d3.json, "http://secret-falls-4489.herokuapp.com/?s=california")
  .await(drawMap);

function drawMap(error, map){
  svg.selectAll("path")
    .data(topojson.feature(map, map.objects.collection).features).enter()
    
    .append("path")
    	.attr("d", path)
    	.attr("id", function(d){
    		return "dm" + d.id;
    });

    articlesListener(); 
    //tweetsListener();
};

function drawCircles(articles){
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
        .attr("class", "hiding")
    		.text(function(){
    			return d.title;
    		});
    	d3.select('article').data(articles)

    		.text(function(){
    			return d.text.replace(/\n+/g,"\n\n");
    		});
    });
}

function removeCircle(article){
	console.log(article);
  svg.selectAll(".dot")
    .data(article).exit()
	
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
	articlesCollection.on('child_removed',function(snapshot){
		circle = snapshot.val();
		console.log(circle);
    console.log(articles.indexOf(circle)); // logs -1 because article is no longer in database
    removeCircle(circle);
	});
};
