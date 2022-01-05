function CO2lineChart(data){

  // dimensions 
  var margin = {top: 30, right: 30, bottom: 30, left: 60},
      width = $("#mid-chart").width() - margin.left - margin.right,
      height = $("#mid-chart").height() - margin.top - margin.bottom;

  //Append svg-object to the correct div
  var svg = d3.select("#mid-chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + ',' + margin.top + ")");

    
  var parseDate = d3.timeParse("%Y-%m-%d");
  var bisectDate = d3.bisector(function(d) { return parseDate(d.Date); }).left;

  
  var xScale = d3.scaleTime()
  .domain([parseDate("1743-11-01"), parseDate("2020-01-01")])
  .range([0, width]);

  var xAxis = svg.append("g")
  				.attr("class", "axis axis--x")
  				.attr("transform", "translate(0," + height + ")")
  				.call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

  // Add Y axis
  var yScale = d3.scaleLinear()
    .domain([300, d3.max(data, function(d) { return d.ppm; })])
    .range([ height, 0]);

  var yAxis = svg.append("g")
  				 .attr("class", "axis axis--y")
                 .call(d3.axisLeft(yScale));


  var dataLine = d3.line()
    .x(function(d) { return xScale(parseDate(d.Date)) })
    .y(function(d) { if(d.ppm != null) return yScale(d.ppm) });


  //REGRESSION
  var regArray = [];
  for(let i = 0; i < data.length; i++){
    regArray.push([i, parseFloat(data[i].ppm)]);
  }
  //var linearRegression = regression.linear(regArray);
  var linearRegression = regression.polynomial(regArray, {order: 2, precision: 5});
  console.log(linearRegression);

  var date = parseDate("1958-03-15");
  
  var regData = [];

  for(let i = 0; i< data.length; i++) {   
    data[i]['prediction'] = linearRegression.points[i][1];
  }

  var date = parseDate("2020-02-15");
  console.log("Regression line: ", linearRegression.string);
  for(let i = 0; i < 120; i++) {
    var obj = {Date: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(), ppm: null, prediction: linearRegression.predict(i + data.length)[1]};
    data.push(obj);
    date.setMonth(date.getMonth() + 2);
  }

  let predictionLine = d3.line()
    .x( d => xScale(parseDate(d.Date)))
    .y( d => yScale(d.prediction));
  

  svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#e31a1c")
    .attr("stroke-width", 2.0)
    .attr("d", dataLine)
    .attr("data-legend", "Measurements")
    .on("mouseover", function() {
      d3.select(this).attr("stroke-width", 3.0);
    })
    .on("mouseout", function() {
      d3.select(this).attr("stroke-width", 1.0);
    });


  svg.append("path")
    .datum(data)
    .attr("class", "prediction")
    .attr("fill", "none")
    .attr("data-legend", "Prediction")
    .attr("stroke-dasharray", "3,3")
    .attr("stroke", "#FFFFFF")
    .attr("stroke-width", 1.0)
    .attr("d", predictionLine)


  function mousemove() {
  	var x0 = xScale.invert(d3.mouse(this)[0]),
  		i = bisectDate(data, x0, 1),
  		d0 = data[i - 1],
  		d1 = data[i],
  		d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
  	focus.attr("transform", "translate(" + xScale(parseDate(d.Date)) + "," + yScale(d.ppm) + ")");
  	focus.select(".tooltip-date").text(d.Date);
	focus.select(".tooltip-value").text(d.ppm);
  }

  	//HOVER TOOLTIP
  	var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

  	focus.append("circle")
	    .attr("r", 5);

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
	    .text("ppm:");

	focus.append("text")
	    .attr("class", "tooltip-value offset")
	    .attr("x", 60)
	    .attr("y", 18);

	svg.append("rect")
	        .attr("class", "overlay")
	        .attr("width", width)
	        .attr("height", height)
	        .on("mouseover", function() { focus.style("display", null); })
	        .on("mouseout", function() { focus.style("display", "none"); })
	        .on("mousemove", mousemove);

  //Create title
  svg.append("text")
    .attr("x", width/2 )
    .style("text-anchor", "middle")
    .attr("class", "text")
    .text("Trends in Atmospheric CO2");

  // text label for the y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .attr("class", "text")
    .text("CO2 [ppm]");

  
  //Create legend
  var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(10, 10)")
    .style("font-size", "12px")
    .call(d3.legend);

  setTimeout(function() { 
    legend
      .style("font-size","12px")
      .attr("data-style-padding",10)
      .call(d3.legend)
  },1000)

  this.changeLineChart = function update(minDate, maxDate){
    xScale.domain([minDate, maxDate]);
    xAxis.transition().duration(1000).call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

    var brushedData = [];

    data.forEach(function(d) {
      var parsedDate = parseDate(d.Date);
      
      if(parsedDate <= maxDate && parsedDate >= minDate){
          brushedData.push(d);
      }
    })

    yScale.domain([300, d3.max(brushedData, function(d) { return d.prediction > d.ppm ? +d.prediction : +d.ppm; })]);
    yAxis.transition().duration(1000).call(d3.axisLeft(yScale));
    

    var path = d3.select("#mid-chart").transition();
    path.select("path.line").duration(1000).attr("d", dataLine(brushedData));
    path.select("path.prediction").duration(1000).attr("d", predictionLine(brushedData));
    
    svg.select(".overlay").on("mousemove", brushedMousemove);
    //svg.selectAll("circle.myCircle").remove();

    function brushedMousemove() {
	  	var x0 = xScale.invert(d3.mouse(this)[0]),
	  		i = bisectDate(brushedData, x0, 1),
	  		d0 = brushedData[i - 1],
	  		d1 = brushedData[i],
	  		d = x0 - parseDate(d0.Date) > parseDate(d1.Date) - x0 ? d1 : d0;

	  	var offset =  xScale(parseDate(d.Date)) < 0.5 * width ? 0 : -120;
	  	focus.attr("transform", "translate(" + xScale(parseDate(d.Date)) + "," + yScale(d.ppm) + ")");
	  	focus.selectAll(".offset").attr("transform", "translate(" + offset + "," + 0 + ")");
	  	focus.select(".tooltip-date").text(d.Date);
		focus.select(".tooltip-value").text(d.ppm);
	  }
  }

}