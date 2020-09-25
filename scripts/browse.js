var requestURL = "";
var rowData = [];
var authorsname = "";
var abstractdata = "";
window.onload = nodata;

//nav-buttons
const allneur = document.querySelector("#allneur");
const allwacv = document.querySelector("#allwacv");
//const alliclr = document.querySelector("#alliclr");
const alliccv = document.querySelector("#alliccv");
const allcvpr = document.querySelector("#allcvpr");

allneur.addEventListener("click", () =>
  showdata("NeurIPS", ["2015", "2016", "2017", "2018", "2019"])
);
allwacv.addEventListener("click", () => showdata("WACV", ["2020"]));
//alliclr.addEventListener("click", () => showdata("ICLR", ["2020"]));
alliccv.addEventListener("click", () => showdata("ICCV", ["2017", "2019"]));
allcvpr.addEventListener("click", () =>
  showdata("CVPR", ["2016", "2017", "2018", "2019"])
);

//Get data
function showdata(confname, yr) {
  rowData = [];
  authorsname = "";
  abstractdata = "";

  if (typeof confname === "string") {
    for (let x of yr) {
      requestURL = getUrl(confname, x);
      populatedata(requestURL);
    }
  } else {
    console.log("WIP");
  }
}

//Construct URL
function getUrl(conf, year) {
  URL = "./scrape/data/" + conf + "/" + conf + "_" + year + ".json";
  return URL;
}

//Gather and show data
function populatedata(url) {
  let request = new XMLHttpRequest();
  request.open("GET", url);
  request.responseType = "json";
  request.send();
  request.onload = function () {
    const mypapers = request.response;
    populateMain(mypapers);
  };
}

//Render data
function populateMain(jsonObj) {
  let count = 0;

  for (let key in jsonObj) {
    if (jsonObj.hasOwnProperty(key)) {
      value = jsonObj[key];
      count++;
    } else {
      console.log("no entry found!");
      break;
    }

    authorsname = "";
    for (let j = 0; j < value.authors.length; j++) {
      if (j == value.authors.length - 1) {
        authorsname += value.authors[j] + ".";
      } else {
        authorsname += value.authors[j] + ", ";
      }
    }

    rowData.push({
      title: value.title,
      author: authorsname,
      abstract: value.abstract,
      link: value.link,
    });
  }
  console.log(count);

  const grid = document.querySelector(".ag-root-wrapper");
  if (grid) {
    grid.remove();
  }
  //ag grid
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
          "<a href=" + params.value + ' target="_blank">' + params.value + "</a>"
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
}

function onFirstDataRendered(params) {
  params.api.sizeColumnsToFit();
}

function nodata() {
  var x, i;
  x = document.querySelectorAll(".na");
  for (i = 0; i < x.length; i++) {
    x[i].addEventListener("click", function () {
      const na = document.querySelector(".ag-root-wrapper > span");
      na.textContent = "Sorry No Data found for this entry!";
    });
  }
}
