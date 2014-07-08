# takes in a shapefile, clips it to the boundaries of another shapefile and writes to disk the result as GEOJson

require 'rgeo-geojson'
require 'rgeo-shapefile'
require 'json'

object = {}
object["type"] = "FeatureCollection"
object["features"] = []

RGeo::Shapefile::Reader.open("./data/california/california-no_islands.shp") do |file|
  file.each do |record|
    @california_geometry = record.geometry
  end
end
 
RGeo::Shapefile::Reader.open("./data/USDM_20140617_M/USDM_20140617.shp") do |file|
  file.each do |record|
    clipped_geometry = (record.geometry).intersection(@california_geometry)

    feature = RGeo::GeoJSON::Feature.new(clipped_geometry, record.index, record.attributes)
    object["features"].push(RGeo::GeoJSON.encode(feature))
  end
end

open("./data/blah.json", "wb") do |file| 
  file.write(object.to_json) 
end  
