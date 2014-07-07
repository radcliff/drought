require 'date'
require 'typhoeus'
require 'zip'
require 'rgeo-geojson'
require 'rgeo-shapefile'
require 'json'


def unzip_file (file_name, destination_path)
  Zip::File.open(file_name) do |zip_file|
   zip_file.each do |f|
     f_path = File.join(destination_path, f.name)
     FileUtils.mkdir_p(File.dirname(f_path))
     zip_file.extract(f, f_path) unless File.exist?(f_path)
   end
  end
end

# The data cutoff for Drought Monitor maps is Tuesday at 8 a.m. EDT. 
# The maps, which are based on analysis of the data, are released each Thursday at 8:30 a.m. Eastern Time.

today = Date.today
tuesday = today - 4
tuesday = tuesday.to_s
tuesday.gsub!("-","")

response = Typhoeus.get("http://droughtmonitor.unl.edu/data/shapefiles_m/USDM_#{tuesday}_M.zip") if Time.now.thursday?

open("USDM_#{tuesday}_M.zip", "wb") do |file|
  file.write(response.body)
end

unzip_file("USDM_#{tuesday}_M.zip", "./data/USDM_#{tuesday}_M")

object = {}
object["type"] = "FeatureCollection"
object["features"] = []
 
RGeo::Shapefile::Reader.open("./data/USDM_#{tuesday}_M/USDM_#{tuesday}.shp") do |file|
  file.each do |record|
    feature = RGeo::GeoJSON::Feature.new(record.geometry, record.index, record.attributes)
    object["features"].push(RGeo::GeoJSON.encode(feature))
  end
end

open("./data/USDM_#{tuesday}.json", "wb") do |file| 
  file.write(object.to_json) 
end  


#remove zipfile

#remove shapefile

#send geojson to firebase database or postgis 
#RGeo::Geos.supported? => true/false
