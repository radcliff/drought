#California D3rought

This basic single-page app leverages a government dataset, D3 and Firebase. Client side events drive dynamic changes to elements on the page. 

##Features
* Client-only app
* Drought severity data from the US Drought Monitor
* GeoJSON/TopoJSON files rendered as SVG elements with D3 geo
* Real-time document storage with Firebase(noSQL)
* Calls to Twitter API leveraging Codebird.js API wrapper

Using a simply Ruby script and the amazing RGeo library, clipping the drought data and converting it to GeoJSON is easy. However, saving newly converted JSON to disk seems like a naive and slow solution when compared to an indexed PostGIS database.

##In the future
I would like to build a Rails app with a PostGIS database, and utilizing the rgeo-shapefile gem to insert shapes directly into the database. This Rails app could easily be made into a public json API allowing anyone to develop on top of the US Drought Monitor dataset.
