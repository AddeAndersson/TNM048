function naturalDisLineChart(data){

  // console.log(d3.max(data , d => d.Date));
  // console.log(d3.min(data , d => d.Date));
  
  
  
    // dimensions 
    var margin = {top: 30, right: 30, bottom: 30, left: 60},
        width = $("#bottom-chart").width() - margin.left - margin.right,
        height = $("#bottom-chart").height() - margin.top - margin.bottom;
  
    //Append svg-object to the correct div
    var svg = d3.select("#bottom-chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + ',' + margin.top + ")");
  
      
    var parseDate = d3.timeParse("%Y");
    var bisectDate = d3.bisector(function(d) { return parseDate(d.Date); }).left;
  
    // Add X axis --> it is a date format
    var xScale = d3.scaleTime()
      .domain([parseDate("1743"), parseDate("2020")])
      .range([0, width]);
        
    var xAxis = svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));
  
    // Add Y axis
    var yScale = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.reported_disasters; })])
      .range([ height, 0]);
  
    var yAxis = svg.append("g")
                  .attr("class", "axis axis--y")
                  .call(d3.axisLeft(yScale));

    var dataLine = d3.line()
        .x(function(d) { return xScale(parseDate(d.Date)) })
        .y(function(d) { return yScale(d.reported_disasters) });

    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {return d.Entity;})
        .entries(data);

    //console.log(dataNest);
        
    var colorSeries = [
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#8c510a"];
    var color = d3.scaleOrdinal().range(colorSeries); 
    //console.log(color);

    //  // Loop through each symbol / key
    dataNest.forEach(function(d) {
        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("class", "disaster")
            .style("stroke", function() {return [d.color = color(d.key)]})
            .attr("stroke-width", 1.0)
            .attr("d", dataLine(d.values))
            .attr("data-legend", function() {return d.key})
            .on("mouseover", function() {
              d3.select(this).attr("stroke-width", 3.0);
            })
            .on("mouseout", function() {
              d3.select(this).attr("stroke-width", 1.0);
            });
    });


    //Create title
    svg.append("text")
      .attr("x", width/2 )
      .attr("class", "text")
      .style("text-anchor", "middle")
      .text("Natural disasters");
  
    // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height/2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("class", "text")
      .text("Quantity");
  
    // Text label for the x axis
    svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                          (height + margin.top) + ")")
      .style("text-anchor", "middle")
      .attr("class", "visible")
      .attr("class", "text")
      .text("Year");

    //Create legend
    var legend = svg.append("g")
                  .attr("class", "legend")
                  .attr("transform", "translate(10, 10)")
                  .style("font-size", "12px")
                  .call(d3.legend);

    setTimeout(function() { 
      legend
        .style("font-size","12px")
        .attr("data-style-padding", 10)
        .call(d3.legend)
    },1000)

    //HOVER TOOLTIP
    var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

      focus.append("line")
          .attr("stroke", "grey")
          .attr("y1", 0)
          .attr("y2", height);

      focus.append("circle")
          .attr("r", 5);

      focus.append("g");

      focus.append("rect")
          .attr("class", "tooltip offset")
          .attr("width", 220)
          .attr("height", 140)
          .attr("x", 10)
          .attr("y", -22)
          .attr("rx", 4)
          .attr("ry", 4);

      focus.append("text")
          .attr("class", "tooltip-date offset")
          .attr("x", 18)
          .attr("y", -2);

      focus.append("text")
          .attr("class", "label offset")
          .attr("x", 18)
          .attr("y", 18);

      focus.append("text")
          .attr("class", "tooltip-value offset")
          .attr("x", 60)
          .attr("y", 18);

      svg.append("rect")
            .attr("class", "overlay_nat")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() {
              focus.style("display", null);
              legend.style("display", "none");

            })
            .on("mouseout", function() { 
              focus.style("display", "none");
              legend.style("display", null);
            })
            .on("mousemove", mousemove);

      function mousemove() {

      }


    this.changeDisasterChart = function update(minDate, maxDate){
      xScale.domain([minDate, maxDate]);
      xAxis.transition().duration(1000).call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

      minDate = parseDate(minDate.getFullYear());
      maxDate = parseDate(maxDate.getFullYear());

      var brushedData = [];

      data.forEach(function(d) {
        var parsedDate = parseDate(d.Date);
        if(parsedDate <= maxDate && parsedDate >= minDate){
            brushedData.push(d);
        }
      })


      yScale.domain([0, d3.max(brushedData, function(d) { return +d.reported_disasters; })]);
      yAxis.transition().duration(1000).call(d3.axisLeft(yScale));
      
      dataNest = d3.nest()
        .key(function(d) {return d.Entity;})
        .entries(brushedData);
      
      var path = d3.select("#bottom-chart").transition();

      path.selectAll("path.disaster").duration(1000).attr("d", function(d,i){
          {
            return (dataNest.length <= i) ? 0 : dataLine(dataNest[i].values);
          }
      });

      svg.select(".overlay_nat").on("mousemove", brushedMousemove);
      var tooltipString;

      function brushedMousemove() {
        
        var x0 = xScale.invert(d3.mouse(this)[0]),
          i = bisectDate(dataNest[0].values, x0, 1), //dataaNest[0] -> All Natural Dis.
          d0 = brushedData[i - 1],
          d1 = brushedData[i],
          d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
          //console.log(d);
        var tooltipData = [];
        //Find all values for date d.date and append to focus.tooltip
        dataNest.forEach(function(disaster){
            var value = disaster.values.find(h => h.Date == d.Date);
            tooltipData.push([disaster.key, value != undefined ? value.reported_disasters : null]);
        })

        var offset =  xScale(parseDate(d.Date)) < 0.5 * width ? 0 : -240;  

        focus.select("circle").attr("transform", "translate(" + 0 + "," + yScale(d.reported_disasters) + ")");
        focus.attr("transform", "translate(" + xScale(parseDate(d.Date)) + "," + 0 + ")");
        focus.select(".tooltip-date").text(d.Date); //Set date

        //Add offset if necessary
        focus.selectAll(".offset").attr("transform", "translate(" + offset + "," + 0 + ")");
        
        focus.selectAll("text.label").remove();
        focus.selectAll("text.tooltip-value").remove();

        //Sort texts by number of disasters
        tooltipData.sort(compareSecondColumn);

        function compareSecondColumn(a, b) {
            a[1] = (a[1] == null ? 0 : parseInt(a[1]));
            b[1] = (b[1] == null ? 0 : parseInt(b[1])); 

            return b[1]-a[1];
        }

        //Set labels
        focus.selectAll("text.label")
              .data(tooltipData)
              .enter()
              .append("text")
              .attr("class", "label")
              .attr("transform", "translate(" + offset + "," + 0 + ")")
              .text(function(dis) {
                  return dis[0] + ": ";
              })
              .attr("y", function(dis, i) {return 18 * (i + 1)})
              .attr("x", 18);

        //Set values
        focus.selectAll("text.tooltip-value")
              .data(tooltipData)
              .enter()
              .append("text")
              .attr("class", "tooltip-value")
              .attr("transform", "translate(" + offset + "," + 0 + ")")
              .style("stroke", function(dis, i) {return [dis.color = color(dis[0])]})
              .text(function(dis) {
                  return dis[1];
              })
              .attr("y", function(dis, i) {return 18 * (i + 1)})
              .attr("x", 200);
      }
    
    }
}

