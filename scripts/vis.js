var margin = { top: 20, right: 20, bottom: 30, left: 40 },
  width = 887 - margin.left - margin.right,
  height = 454 - margin.top - margin.bottom;

/*
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x
var xValue = function (d) {
    return d.SalePrice;
  }, // data -> value
  xScale = d3.scale.linear().domain([0, 600000]).range([0, width]), // value -> display
  xMap = function (d) {
    return xScale(xValue(d));
  }, // data -> display
  xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function (d) {
    return d.GrLivArea;
  }, // data -> value
  yScale = d3.scale.linear().domain([0, 4000]).range([height, 0]), // value -> display
  yMap = function (d) {
    return yScale(yValue(d));
  }, // data -> display
  yAxis = d3.svg.axis().scale(yScale).orient("left");

// add the graph canvas to the body of the webpage
var svg = d3
  .select("#graph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .call(
    d3.behavior.zoom().on("zoom", function () {
      svg.attr(
        "transform",
        "translate(" +
          d3.event.translate +
          ")" +
          " scale(" +
          d3.event.scale +
          ")"
      );
    })
  )
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3
  .select("#graph")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// load data
d3.csv("test.csv", function (error, data) {
  // change string (from CSV) into number format
  data.forEach(function (d) {
    d.SalePrice = +d.SalePrice;
    d.GrLivArea = +d.GrLivArea;
    // console.log(d);
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
  yScale.domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1]);

  // draw dots
  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 3)
    .attr("cx", xMap)
    .attr("cy", yMap)
    .on("mouseover", function (d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(d["Cereal Name"] + "<br/> (" + xValue(d) + ", " + yValue(d) + ")")
        .style("left", d3.event.pageX - 250 + "px")
        .style("top", d3.event.pageY - 100 + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(500).style("opacity", 0);
    });
});
