#California D3rought

view the project [here](http://california-drought.s3-website-us-east-1.amazonaws.com/).

This basic single-page app leverages a government dataset, D3 and Firebase. Client side events drive dynamic changes to elements on the page. 

##Features
* Client-only app
* Drought severity data from the US Drought Monitor
* TopoJSON files rendered as SVG elements with D3 geo
* Real-time document storage with Firebase(noSQL)

D3 knows how to handle geodata, when presented as TopoJSON. It loops through a given dataset, and renders a vector image in the browser that corresponds to the features included in the TopoJSON resource.

Firebase provides a rest API for JSON documents that are stored remotely - simply add .json at the end of the URL associated with that resource. And using callbacks, Firebase can push changes to all clients simultaneously.
