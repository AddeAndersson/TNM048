function focusPlusContext(data) {
    
    //Helper variables
    var margin = {top: 30, right: 30, bottom: 30, left: 0},
        margin2 = {top: 30, right: 30, bottom: 30, left: 0}
        width = $("#context").width() - margin.left - margin.right,
        height = $("#context").height() - margin.top - margin.bottom,
        height2 = $("#context").height() - margin2.top - margin2.bottom;

    var parseDate = d3.timeParse("%Y-%m-%d");
    
    //Scales and axis for context
    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);
    

    //Define scale and axis for context
    var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);

    //Set scale parameters
    /*var maxDate = d3.max(data.features, function(d) {
        //if(d.hasOwnProperty("Date")) {return parseDate(d.properties.Date)}
        var keys = Object.keys(d.properties);
        var maxKey = d3.max(keys, function(k) {
            if(k != "name" && k != "pop_est" && k != "continent" && k != "name_formal") {
                return parseDate(k);
            }
        });

        return maxKey;
    });*/

    var maxDate = parseDate("2030-01-01");

    var minDate = d3.min(data.features, function(d) {
        //if(d.hasOwnProperty("Date")) {return parseDate(d.properties.Date)}
        var keys = Object.keys(d.properties);
        var minKey = d3.min(keys, function(k) {
            if(k != "name" && k != "pop_est" && k != "continent" && k != "name_formal") {
                return parseDate(k);
            }
        });

        return minKey;
    });

    //Maximum date of actual data
    /*
    var maxDate2 = d3.max(data.features, function(d) {
        //if(d.hasOwnProperty("Date")) {return parseDate(d.properties.Date)}
        var keys = Object.keys(d.properties);
        var maxKey = d3.max(keys, function(k) {
            if(k != "name" && k != "pop_est" && k != "continent" && k != "name_formal") {
                return parseDate(k);
            }
        });

        return maxKey;
    });
    */

    x.domain([minDate, maxDate]);
    y.domain([0, height2]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    

    var brush = d3.brushX().extent([[0, 0], [width, height2]]).on("end", brushed);
    //brush.extent([parseDate("1960-01-01"), maxDate]);

    var svg = d3.select("#context").append("svg")
                .attr("width", width + margin.left +  margin.right)
                .attr("height", height + margin.top + margin.bottom);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
                    .attr("class", "focused")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
                    .attr("class", "context")
                    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("text")             
      .attr("transform",
            "translate(" + ((width + margin.right + margin.left)/2) + " ," + 
                           (height + margin.top + margin.bottom) + ")")
      .style("text-anchor", "middle")
      .attr("class", "text")
      .text("Year");

    /*context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);*/

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [x(new Date(parseDate("1960-01-01"))), x(new Date(parseDate("2020-01-01")))]);

    function brushed(){

        var selection = d3.event.selection;
        var minMaxDate = selection.map(x2.invert, x2);

        //focus.select(".axis--x").call(xAxis);
        //console.log(minMaxDate);
        map.change_map(minMaxDate[0], minMaxDate[1]);
        CO2lineChart.changeLineChart(minMaxDate[0], minMaxDate[1]);
        naturalDisLineChart.changeDisasterChart(minMaxDate[0], minMaxDate[1]);
        anomalyPrecip.changeBarChart(minMaxDate[0], minMaxDate[1]);
        
    }
}