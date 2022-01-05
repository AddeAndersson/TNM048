function precipitationBar(data){

    //console.log(data);
    //
    // dimensions 
    var margin = {top: 30, right: 30, bottom: /*$("#top-chart").height()/2 +*/ 30, left: 60};
    var width = $("#top-chart").width() - margin.left - margin.right;
    var height = ($("#top-chart").height() - margin.top - margin.bottom)/2;
    var barWidth = width / data.length;  // Width of the bars
  
    //Append svg-object to the correct div
    var svg = d3.select("#top-chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", (height * 2) + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + ',' + margin.top + ")");
    
    //A layer above the graph
    var layer1 = svg.append("g");
    var layer2 = svg.append("g");
      
    var parseDate = d3.timeParse("%Y");

    //console.log(d3.min(data, d => d.Year));
    // console.log(d3.max(data, d => d.Year));

    // Add X axis --> it is a date format
    var xScale = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return parseDate(d.Year);}))
      .range([0, width]);

    // var xScale = d3.scaleTime()
    //     .domain([parseDate("1743-11-01"), parseDate("2020-01-01")])
    //     .range([0, width]);
        
    // var xAxis = d3.axisBottom(xScale);//.ticks(5);
    var xAxis = layer1.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height * 2 + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

    // svg.append("g")
    // .attr("transform", "translate(0," + height * 2 + ")")
    // .call(xAxis);


    var maxValue = d3.max(data, d => +d.Anomaly_mm);

    var yScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, height]);

    //We need a different scale for drawing the y-axis. It needs
    //a reversed range, and a larger domain to accomodate negaive values.
    var minVal = d3.min(data, d => +d.Anomaly_mm);
    var maxVal = d3.max(data, d => +d.Anomaly_mm);

    var yAxisScale = d3.scaleLinear()
        .domain([minVal, maxVal])
        .range([height - yScale(minVal), 0]);

    var yAxis = layer1.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(yAxisScale));

    var focus = layer2.append("g")
                .attr("class", "focus")
                .style("opacity", 0);

    focus.append("rect")
        .attr("class", "tooltip offset")
        .attr("width", 100)
        .attr("height", 50)
        .attr("x", 10)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);

    focus.append("text")
        .attr("class", "tooltip-date offset")
        .attr("x", 18)
        .attr("y", -2);

    focus.append("text")
        .attr("class", "offset")
        .attr("x", 18)
        .attr("y", 18)
        .text("Prec.:");

    focus.append("text")
        .attr("class", "tooltip-value offset")
        .attr("x", 60)
        .attr("y", 18);

    layer1.selectAll("rect.precipitation")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "precipitation")
        .attr("x", function(d, i) { return  i * barWidth; })
        .attr("y", function(d) { return height - Math.max(0, yScale(d.Anomaly_mm));})
        .attr("height", function(d) { return Math.abs(yScale(d.Anomaly_mm)); })
        .attr("width", barWidth)
        .style("fill", "#cfcfcf")
        .style("stroke", "black")
        .style("stroke-width", "1px")

    //Create title
    layer1.append("text")
      .attr("x", width/2 )
      .style("text-anchor", "middle")
      .attr("class", "text")
      .text("Precipitation");
  
    // text label for the y axis
    layer1.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - height)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("class", "text")
      .text("Deviation [mm]");


    this.changeBarChart = function update(minDate, maxDate){
        xScale.domain([minDate, maxDate]);
        xAxis.transition().duration(1000).call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));
      
        minDate = parseDate(minDate.getFullYear());
        maxDate = parseDate(maxDate.getFullYear());

        var brushedData = [];
        data.forEach(function(d) {
          var parsedDate = parseDate(d.Year);
          
          if(parsedDate <= maxDate && parsedDate >= minDate){
              brushedData.push(d);
          }
        })
    
        
        //barWidth = width/brushedData.length;
        barWidth = width / (maxDate.getFullYear() - minDate.getFullYear());
        
        var minDataDate = parseDate("1901");
        
        var start = Math.max(0, barWidth * (minDataDate.getFullYear() - minDate.getFullYear()));

        //Remove old line
        d3.selectAll("rect.precipitation").remove();

        var minVal = d3.min(brushedData, d => +d.Anomaly_mm);
        var maxVal = d3.max(brushedData, d => +d.Anomaly_mm);
        
        yScale.domain([0, maxVal]);
        
        yAxisScale.domain([minVal, maxVal]).range([height - yScale(minVal), 0]);
        //yAxisScale.domain([minVal, maxVal]).range([0, maxVal]);

        yAxis.transition().duration(1000).call(d3.axisLeft(yAxisScale));

        layer1.selectAll("rect")
        .data(brushedData)
        .enter()
        .append("rect")
        .attr("class", "precipitation")
            .attr("x", function(d, i) {return  (i * barWidth + start); })
            .attr("y", function(d) { return height - Math.max(0, yScale(d.Anomaly_mm));})
            .attr("height", function(d) { return Math.abs(yScale(d.Anomaly_mm)); })
            .attr("width", barWidth)
            .style("fill", "#cfcfcf")
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .on("mouseover", function(d){
                var offset =  xScale(parseDate(d.Year)) < 0.5 * width ? 0 : -120;
                d3.select(this).style("fill", "#e31a1c");
                focus.style("opacity", 1);
                focus.attr("transform", "translate(" + d3.select(this).attr("x") + "," + d3.select(this).attr("y") + ")");
                focus.selectAll(".offset").attr("transform", "translate(" + offset + "," + 0 + ")");
                focus.select(".tooltip-date").text(d.Year);
                focus.select(".tooltip-value").text(parseFloat(d.Anomaly_mm).toFixed(2));
            })
            .on("mouseout", function() {
                focus.style("opacity", 0);
                d3.select(this).style("fill", "#cfcfcf");
            })
    }
}