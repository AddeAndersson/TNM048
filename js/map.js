

function map(data){

  //var leaflet_map = L.map("mapid", {drawControl: true}).setView([10, 15], 1);
  var parseDate = d3.timeParse("%Y-%m-%d");

  var map = L.map('mapid', {drawControl: true}).setView([53, 9], 1.5);
  //L.tileLayer(map_link()).addTo(map);
  map.createPane('labels'); map.getPane('labels').style.zIndex = 650;
  map.getPane('labels').style.pointerEvents = 'none';

  /*
  var positronLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        pane: 'labels'
  }).addTo(map);
  */

  var Stamen_TerrainLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-labels/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 18,
    ext: 'png',
    pane: 'labels'
  }).addTo(map);

  var tooltip = d3.select("#mapid").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

  
  var legendControl = L.control({position: 'topright'});
  legendControl.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'); 
    return div;
  }

  legendControl.addTo(map);

  var geoLayer = L.geoJson(

    data, {clickable: false, style: style,
            onEachFeature: function(feature, layer) {

                var displayName = feature.properties['name_formal'] === null ? feature.properties['name'] : feature.properties['name_formal'];
                layer.on("mouseover", function() {
                    var value = feature.properties['avgTemp'] == null ? "Missing" : feature.properties['avgTemp'].toFixed(2) + "&degC";
                    this.setStyle({"weight": 3, "color": "white"});
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1.0)
                        .style("z-index", 900);
                    tooltip.html("<strong>" + displayName + "</strong></br>" + value);
                });

                layer.on("mouseout", function() {
                    this.setStyle({"weight": 0.5, "color": "black"});
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.0)
                        .style("z-index", -1);
                });
                feature.properties['avgTemp'] = meanTemp(feature.properties, parseDate("1500-01-01"), parseDate("2030-01-01"));
            }
          }
  ).addTo(map);

  /*function mousemove() {
    tooltip.style("left", (d3.event.pageX - 34) + "px")
    .style("top", (d3.event.pageY - 12) + "px");
  }*/
  /*geojson.eachLayer(function (layer) {
      layer.bindPopup(layer.feature.properties.name);
  });*/
  //console.log(data.features[0].properties);

  this.change_map = function update(minDate, maxDate) {
      geoLayer.eachLayer(function(layer) {
        layer.feature.properties['avgTemp'] = meanTemp(layer.feature.properties, minDate, maxDate);
        layer.setStyle({fillColor: getColor(layer.feature.properties['avgTemp'])});
      });
  }

  //map.fitBounds(geojson.getBounds());
  
  function style(feature) {
    return {
      fillColor: getColor(feature.properties['avgTemp']),
      weight: 0.5,
      opacity: 1.0,
      color: 'black',
      fillOpacity: 1.0,
      transition: 'all 1s ease-in',
    };
  }

  //Diverging color scheme from Colorbrewer
  function getColor(avgTemp) {
    
    //var avgTemp = meanTemp(d, minDate, maxDate);
    if(avgTemp === null) return '#000000';

    return avgTemp > 30  ? '#a50026' :
           avgTemp > 24  ? '#d73027' :
           avgTemp > 18  ? '#f46d43' :
           avgTemp > 12  ? '#fdae61' :
           avgTemp > 6   ? '#fee090' :
           avgTemp > 0   ? '#ffffbf' :
           avgTemp > -6  ? '#e0f3f8' :
           avgTemp > -12 ? '#abd9e9' :
           avgTemp > -18 ? '#74add1' :
           avgTemp > -24 ? '#4575b4' :
           '#313695';
  }
  var caption = ["<strong>Average Temperature [&degC]</strong>"];
  var labels = ["> 30",
                "> 24", "> 18",
                "> 12", "> 6",
                "> 0", "> -6", 
                "> -12", "> -18", 
                "> -24", "< -24"];
  var dummy = 31;
  for(var i = 0; i < labels.length; i++){
    caption.push('<i style="background: ' + getColor(dummy) + '"></i>' + labels[i]);
    dummy -= 6;
  }
  caption.push('<i style="background: ' + getColor(null) + '"></i>' + "Missing");
  var legendText = caption.join('</br>');

  d3.select(".legend.leaflet-control").html(legendText);


  
  //Calculates the mean temperature over entire available period
  function meanTemp(d, minDate, maxDate){
    var sum = 0;
    var counter = 0;
    var null_check = true;
    //console.log(d);

    for(var key in d) {
        if(d.hasOwnProperty(key) && key != "name" && key != "pop_est" && key != "continent" && key != "name_formal"){
            
            var date = parseDate(key);

            if(d[key] != null && date <= maxDate && date >= minDate) {
                //console.log("here");
                null_check = false;
                sum += d[key];
                counter += 1;
            }
        }
    }

    return null_check ? null : sum/counter;
  }
  
  //Link to get the leaflet map
  function map_link() {
      //return "https://api.mapbox.com/styles/v1/mapbox/dark-v10.html?title=true&access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NDg1bDA1cjYzM280NHJ5NzlvNDMifQ.d6e-nNyBDtmQCVwVNivz7A#2/0/0";
      return "https://api.mapbox.com/styles/v1/josecoto/civ8gwgk3000a2ipdgnsscnai/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam9zZWNvdG8iLCJhIjoiY2l2OGZxZWNuMDAxODJ6cGdhcGFuN2IyaCJ9.7szLs0lc_2EjX6g21HI_Kg";
  }
}
