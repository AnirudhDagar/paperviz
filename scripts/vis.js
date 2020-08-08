// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 887 - margin.left - margin.right,
  height = 454 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#graph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv(
  "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv",
  function (data) {
    // Add X axis
    var x = d3.scaleLinear().domain([0, 3000]).range([0, width]);

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 400000]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));
    svg.call(
      d3
        .brush() // Add the brush feature using the d3.brush function
        .extent([
          [0, 0],
          [887, 454],
        ])
        .on("start brush", updateChart) // initialise the brush area
        .on("end", brushend)
    );

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add dots
    var myDots = svg
      .append("g")
      .selectAll("circle")
      .data(
        data.filter(function (d, i) {
          return i < 1000;
        })
      ) // the .filter part is just to keep a few dots on the chart, not all of them
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.GrLivArea);
      })
      .attr("cy", function (d) {
        return y(d.SalePrice);
      })
      .attr("r", 1)
      .attr("class", "dot")
      .style("fill", "#69b3a2")
      .style("opacity", 0.5)
      .style("stroke", "white");

    // Function that is triggered when brushing is performed
    function updateChart() {
      extent = d3.event.selection;
      myDots.classed("selected", function (d) {
        return isBrushed(extent, x(d.GrLivArea), y(d.SalePrice));
      });
    }

    // A function that return TRUE or FALSE according if a dot is in the selection or not
    function isBrushed(brush_coords, cx, cy) {
      var x0 = brush_coords[0][0],
        x1 = brush_coords[1][0],
        y0 = brush_coords[0][1],
        y1 = brush_coords[1][1];
      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
    }

    function brushend() {
      if (!d3.event.selection) return;
      var d_brushed = d3.selectAll(".selected").data();
      console.log(d_brushed);

      $("#render").empty();
      for (var i = 0; i < d_brushed.length; i++) {
        document.getElementById("render").innerHTML += `<div class="card">
            <p class="title">ReMixMatch: Semi-Supervised Learning with Distribution Matching and Augmentation Anchoring</p>
            <p class="author">David Berthelot, Nicholas Carlini, Ekin D. Cubuk, Alex Kurakin, Kihyuk Sohn, Han Zhang, Colin Raffel</p>
            <div class="img-container"></div>
           </div>`;
      }
    }
  }
);
