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
d3.json(
  "https://raw.githubusercontent.com/AnirudhDagar/paperviz/dev/extra/iclr_2020_all_sci_bert_v2.json?token=AOK3RGX6PKCG3VMHCIJJERS7IPXMW",
  function (data) {
    // Add X axis
    var x = d3.scaleLinear().domain([-30, 30]).range([0, width]);

    // Add Y axis
    var y = d3.scaleLinear().domain([-30, 30]).range([height, 0]);
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
          return i;
        })
      )
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.embedding[0]);
      })
      .attr("cy", function (d) {
        return y(d.embedding[1]);
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
        return isBrushed(extent, x(d.embedding[0]), y(d.embedding[1]));
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

      $("#render").empty();
      for (var i = 0; i < d_brushed.length; i++) {
        let authorList = "";
        for (var j of d_brushed[i].authors) {
          authorList += j + ", ";
        }
        document.getElementById("render").innerHTML += `<div class="card">
            <p class="title">${d_brushed[i].title}</p>
            <p class="author">${authorList}</p>
            <div class="img-container"></div>
           </div>`;
        console.log(d_brushed[i].embedding);
      }
    }
  }
);
