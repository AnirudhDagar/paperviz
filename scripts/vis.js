var rowData = [];
// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = window.innerWidth * 0.6 - margin.left - margin.right,
  height = window.innerHeight * 0.8 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#graph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.top + ")");

//Read the data
d3.json(
  "https://raw.githubusercontent.com/AnirudhDagar/paperviz/master/extra/iclr_2020_all_embed.json?token=AOK3RGSHYG367TLMPAYUCNK7OSW7K",
  function (data) {
    // Add X axis
    var x = d3.scaleLinear().domain([-45, 40]).range([0, width]);

    // Add Y axis
    var y = d3.scaleLinear().domain([-45, 40]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));
    svg.call(
      d3
        .brush() // Add the brush feature using the d3.brush function
        .extent([
          [0, 0],
          [width, height],
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
        return x(d.embedding_specter[0]);
      })
      .attr("cy", function (d) {
        return y(d.embedding_specter[1]);
      })
      .attr("r", 4.5)
      .attr("class", "dot")
      .style("fill", "#69b3a2")
      .style("opacity", 0.7)
      .style("stroke", "white")
      .call(_tooltip);

    // Function that is triggered when brushing is performed
    function updateChart() {
      extent = d3.event.selection;
      myDots.classed("selected", function (d) {
        return isBrushed(
          extent,
          x(d.embedding_specter[0]),
          y(d.embedding_specter[1])
        );
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
      rowData = [];
      d_brushed.forEach((d) => handleTable(d));
      d_brushed.forEach((d) => {
        document.getElementById("render").innerHTML += `<div class="card">
            <p class="title">${d.title}</p>
            <p class="author">${d.authors.join(", ")}</p>
            <div class="img-container"></div>
           </div>`;
      });
    }

    document.querySelector(".search-btn").addEventListener("click", search);
    document.querySelector("#search-ip").addEventListener("keyup", (e) => {
      if (e.keyCode === 13) {
        search();
      }
    });
    document.querySelector("body").addEventListener("click", () => {
      document.querySelectorAll(".dot:not(.selected)").forEach((d) => {
        d.style.opacity = 0.7;
      });
    });

    function search() {
      let search_q = document.querySelector("#search-ip").value.toLowerCase();
      myDots.classed("selected", (d) => {
        return (
          d.title.toLowerCase().search(search_q) != -1 ||
          d.abstract.toLowerCase().search(search_q) != -1
        );
      });
      document.querySelectorAll(".dot:not(.selected)").forEach((d) => {
        d.style.opacity = 0.2;
      });
    }
  }
);

const _tooltip = function _tooltip(selection) {
  var div = d3
    .select("#graph")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  selection
    .on("mouseover.tooltip", function (d) {
      div.style("opacity", "1").style("z-index", "100");
      div
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 100 + "px");
      document.querySelector(".tooltip").innerHTML = `<div class="tt-card">
        <p class="title">${d.title}</p>
        <p class="author">${d.authors.join(", ")}</p>
        <div class="img-container"></div>
       </div>`;
    })
    .on("mouseout.tooltip", function () {
      div.style("opacity", "0").style("z-index", "-100");
    });
};

function handleTable(data) {
  const grid = document.querySelector(".ag-root-wrapper");
  if (grid) {
    grid.remove();
  }
  rowData.push({
    title: data.title,
    author: data.authors.join(", "),
    abstract: data.abstract,
    link: data.link,
  });

  var columnDefs = [
    {
      headerName: "Title",
      field: "title",
      sortable: true,
      filter: true,
      tooltipField: "title",
      flex: 1,
    },
    {
      headerName: "Authors",
      field: "author",
      sortable: true,
      filter: true,
      tooltipField: "author",
      flex: 1,
    },
    {
      headerName: "Keywords",
      field: "abstract",
      sortable: true,
      filter: true,
      tooltipField: "abstract",
      minWidth: 400,
      flex: 2,
    },
    {
      headerName: "Link",
      field: "link",
      cellRenderer: function (params) {
        return (
          "<a href=" + params.value + 'target="_blank">' + params.value + "</a>"
        );
      },
      maxWidth: 200,
      flex: 1,
      floatingFilter: false,
    },
  ];

  var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    enableBrowserTooltips: true,
    onFirstDataRendered: onFirstDataRendered,
    pagination: true,
    defaultColDef: {
      resizable: true,
      floatingFilter: true,
      filter: "agNumberColumnFilter",
    },
  };

  var eGridDiv = document.querySelector("#myGrid");
  new agGrid.Grid(eGridDiv, gridOptions);

  function onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();
  }
}
