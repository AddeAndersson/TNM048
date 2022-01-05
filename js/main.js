//Passing data to the function
var map, focus_plus_context, points, CO2lineChart, anomalyPrecip, naturalDisLineChart;
//d3.csv("./data/Temperature/GlobalLandTemperaturesByCountry.csv" , function (data) {


d3.csv("./data/CO2/archive.csv",function(data){

   // "./data/CO2/archive.csv"

   // Test data: "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv"
   CO2lineChart = new CO2lineChart(data);
   
})

d3.csv("./data/natural-disaster-data/natural_disasters_modified_2.csv",function(data){

   // "./data/CO2/archive.csv"
   naturalDisLineChart = new naturalDisLineChart(data);
})

d3.csv("./data/Precipitation/anomalyPercip2.csv",function(data){

   // "./data/CO2/archive.csv"

   anomalyPrecip = new precipitationBar(data); 
})

$.getJSON('./data/merged_geo.geojson', function(data) { 
  //Working with the map
  map = new map(data);
  focus_plus_context = new focusPlusContext(data);
})

// var geoData = "./data/merged_geo.geojson";
// var co2Data = "./data/CO2/archive.csv"; 
// var naturalDisasterData = "./data/natural-disaster-data/natural_disasters_modified.csv";
// var anomalyPercipitationData = "./data/Precipitation/anomalyPercip2.csv";

// Promise.all([
//    $.getJSON(geoData),
//    d3.csv(co2Data),
//    d3.csv(naturalDisasterData),
//    d3.csv(anomalyPercipitationData)
// ]).then(function(data){

//        // Map
//        map = new map(data[0]);
//        focus_plus_context = new focusPlusContext(data[0]);
// console.log(data);

//        // Natural disaster
//        naturalDisLineChart = new naturalDisLineChart(data[1]);
//        //console.log(data);
      
//        // CO2
//        CO2lineChart = new CO2lineChart(data[2]);

//       // Percipitation deviation
//       anomalyPercip = new percipitationBar(data[3]); 

// })
