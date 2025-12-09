const header=document.querySelector("header");
const menuBar=document.querySelector(".menubar")
const menuBtn=menuBar.querySelector(".menu-btn");
const main=document.querySelector("main");
const mainLogo= menuBar.querySelector(".logo");
const bottomLogo=header.querySelector(".header-bottom-img-container img");


let menuOpen = true;
function applyLayout() {
  if(menuOpen){
    header.classList.remove("collapsed");
    bottomLogo.src="./assets/images/svm-logo-dark.webp"
  }
  else{
    header.classList.add("collapsed");
    setTimeout(()=>{
      bottomLogo.src="./assets/images/mack-logo.png"
    },500)

  }
}

menuBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  applyLayout();
   setTimeout(updateNavScroll, 600);
});

function updateNavScroll() {
    const nav = document.querySelector("header nav");

    if (nav.scrollHeight > nav.clientHeight) {
        nav.classList.add("with-scrollbar");
        nav.classList.remove("no-scrollbar");
    } else {
        nav.classList.remove("with-scrollbar");
        nav.classList.add("no-scrollbar");
    }
}
window.addEventListener("resize", updateNavScroll);
window.addEventListener('resize', applyLayout);

applyLayout();
updateNavScroll();

const auditForm=document.querySelector(".audit-form-wrapper .audit-form")

const selectInputs=auditForm.querySelectorAll(".custom-select");
selectInputs.forEach(select=>{
  const selectedItem=select.querySelector(".selected-item")
  const options=select.querySelectorAll("li");
  const realInput = select.querySelector(".real-value");
  select.addEventListener('click',()=>{
    select.classList.toggle("active");
    selectedItem.querySelector("img").classList.toggle("active");
    options.forEach(option=>{
      option.addEventListener("click",()=>{
        options.forEach(opt=>{
          opt.classList.remove("active");
        })
        option.classList.add("active");
        const selectVal=option.getAttribute("data-value");
        selectedItem.childNodes[0].textContent=selectVal;
        realInput.value=selectVal;
        const inputWrapper=realInput.closest(".input-wrapper")
        if(realInput.value==""){
          inputWrapper.classList.add("error");
        }
        else{
           inputWrapper.classList.remove("error");
        }
      })
    })
  })
   
})
document.addEventListener("click", (e) => {
  selectInputs.forEach(select=>{
    if (!select.contains(e.target)) {
    select.classList.remove("active");
    const selectedItem=select.querySelector(".selected-item")
    selectedItem.querySelector("img").classList.remove("active");
    }
  })
});


const dateInputs = document.querySelectorAll(".audit-form-container input[type='date']");

dateInputs.forEach(dateInput => {
  dateInput.addEventListener("change", function() {
    const val = this.value;
    if (!val) return;

    const [y, m, d] = val.split("-");
    this.nextElementSibling.textContent = `${d}/${m}/${y}`;
  });
});

const fileWrapper=auditForm.querySelector(".file-wrapper")
const browseBtn=auditForm.querySelector(".input-group .browse-btn");

const fileInput=auditForm.querySelector(".attach-file");

const filePreview = fileWrapper.querySelector(".file-preview");
const fileInfo = filePreview.querySelector(".file-info");
const fileName=fileInfo.querySelector(".file-name");
const fileSize=fileInfo.querySelector(".file-size");
const fileNameTooltip=fileInfo.querySelector(".tooltip");
const removeBtn = filePreview.querySelector(".remove-file");


fileInput.accept = ".xlsx, .xls";
const loader=filePreview.querySelector(".loader")
const loaderLabel=filePreview.querySelector(".loader-label");
browseBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", handleFile);
let start = null;
async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const allowed = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"
  ];

  const inputWrapper = fileInput.parentElement;

  if (!allowed.includes(file.type)) {
    fileInput.value = "";
    filePreview.classList.remove("active");
    inputWrapper.classList.add("error");
    const error = inputWrapper.querySelector(".error");
    error.textContent = "please attach the valid file";
    return;
  }

  filePreview.classList.add("active");

  loader.classList.remove("active");
  void loader.offsetWidth;
  loader.classList.add("active");

  start = null; 
  requestAnimationFrame(animate);
  inputWrapper.classList.remove("error");

  let formatted = formatSize(file.size);
  fileName.textContent = file.name;
  fileNameTooltip.textContent = file.name;
  fileSize.textContent = `(${formatted})`;

  const arrayBuffer = await file.arrayBuffer();
  const workbook = await JSZip.loadAsync(arrayBuffer);

  const sharedStringsXML = await workbook.file("xl/sharedStrings.xml")?.async("string");
  const sharedStrings = parseSharedStrings(sharedStringsXML);

  const sheetXML = await workbook.file("xl/worksheets/sheet1.xml")?.async("string");
  const rows = parseSheetAsJSON(sheetXML, sharedStrings);
  sessionStorage.setItem("excelData", JSON.stringify(rows));
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  return [...doc.getElementsByTagName("t")].map(t => t.textContent);
}

function parseSheetAsJSON(sheetXML, sharedStrings = []) {
  if (!sheetXML) return [];

  const xmlDoc = new DOMParser().parseFromString(sheetXML, "text/xml");
  const rowElements = xmlDoc.getElementsByTagName("row");

  const rows = [];

  for (let row of rowElements) {
    const cells = [];
    for (let c of row.getElementsByTagName("c")) {
     
      const v = c.getElementsByTagName("v")[0];

      let value = v ? v.textContent : "";
      if (c.getAttribute("t") === "s") value = sharedStrings[Number(value)];
      cells.push(value);
    }
    rows.push(cells);
  }

  if (rows.length === 0) return [];

  const keys = rows[0];
  const json = [];

  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    rows[i].forEach((cell, index) => {
      obj[keys[index] || `column${index + 1}`] = cell;
    });
    json.push(obj);
  }

  return json;
  // return rows;
}
const tableHeaderHtml=`
  <thead>
    <tr>
      <th rowspan="2" class="col-header">Category</th>
      <th colspan="4">POTENTIAL RISKS FINDINGS COUNT</th>
    </tr>
    <tr>
      <th class="sub-header">Low</th>
      <th class="sub-header">Medium</th>
      <th class="sub-header">High</th>
      <th class="sub-header">Total</th>
    </tr>
  </thead>
  <tbody class="table-body">
  </tbody>`

 const storedData = sessionStorage.getItem("excelData");
if (storedData) {
  const data = JSON.parse(storedData); 
  getCatTableData(data)
 getLocateTableData(data)
}

function getCatTableData(data){
 let obj={};
  data.forEach(d=>{
    const  category=d.mainCategory;
    const risk=d.potentialRisk.toLowerCase()
    if(!obj[category]){
      obj[category]={low:0,medium:0,high:0}
    }
    if(risk==="low"){
      obj[category].low++;
    }
    if(risk==="medium"){
      obj[category].medium++;
    }
    if(risk==="high"){
      obj[category].high++;
    }
  })
  let low=0;
  let medium=0;
  let high=0;
  for(let key in obj){
    low+=obj[key].low;
    medium+=obj[key].low;
    high+=obj[key].low;
  }
  obj["grand total"]={"low":low,"medium":medium,"high":high}
  const catArr=Object.entries(obj).map(([cat,risk])=>({
    "category":cat.toLowerCase(),
    "low":risk.low,
    "medium":risk.medium,
    "high":risk.high,
    "total":risk.low+risk.medium+risk.high
   }
  )
  )
  renderCatTable(catArr)
}


function renderCatTable(catArr){
  const catTable= document.querySelector(".audit-chart-wrapper .chart-category-table-wrapper .category-table");
  catTable.innerHTML="";
  catTable.innerHTML=tableHeaderHtml
  const tbody=catTable.querySelector(".table-body");
  catArr.forEach(data=>{
    let tr=document.createElement("tr")
    tr.innerHTML=`<td>${data.category}</td>
                    <td>${data.low !==0 ? data.low:"-"}</td>
                    <td>${data.medium !==0 ? data.medium:"-"}</td>
                    <td>${data.high !==0 ? data.high:"-"}</td>
                    <td>${data.total !==0 ? data.total:"-"}</td>`
    tbody.appendChild(tr)
  })

}

function getLocateTableData(data){
  console.log(data)
  let obj={};
  data.forEach(d=>{
    const  location=d.Location;
    const risk=d.potentialRisk.toLowerCase()
    if(!obj[location]){
      obj[location]={low:0,medium:0,high:0}
    }
    if(risk==="low"){
      obj[location].low++;
    }
    if(risk==="medium"){
      obj[location].medium++;
    }
    if(risk==="high"){
      obj[location].high++;
    }
  })
  let low=0;
  let medium=0;
  let high=0;
  for(let key in obj){
    low+=obj[key].low;
    medium+=obj[key].low;
    high+=obj[key].low;
  }
  obj["Grand Total"]={"low":low,"medium":medium,"high":high}
  const locArr=Object.entries(obj).map(([loc,risk])=>({
    "location":loc.toLowerCase(),
    "low":risk.low,
    "medium":risk.medium,
    "high":risk.high,
    "total":risk.low+risk.medium+risk.high
   }
  )
  )
  renderLocateTable(locArr)
}

function renderLocateTable(locArr){
  const locateTable= document.querySelector(".audit-chart-wrapper .chart-location-table-wrapper .location-table");
  locateTable.innerHTML="";
  locateTable.innerHTML=tableHeaderHtml
  const tbody=locateTable.querySelector(".table-body");
  locArr.forEach(data=>{
    let tr=document.createElement("tr")
    tr.innerHTML=`<td>${data.location}</td>
                    <td>${data.low !==0 ? data.low:"-"}</td>
                    <td>${data.medium !==0 ? data.medium:"-"}</td>
                    <td>${data.high !==0 ? data.high:"-"}</td>
                    <td>${data.total !==0 ? data.total:"-"}</td>`
    tbody.appendChild(tr)
    
  })
  const catTableBodyRow= document.querySelectorAll(".audit-chart-wrapper .chart-category-table-wrapper .category-table .table-body tr");
  const locateTableBodyRow= document.querySelectorAll(".audit-chart-wrapper .chart-location-table-wrapper .location-table .table-body tr");
  
  if(catTableBodyRow.length > locateTableBodyRow.length){
    const row= catTableBodyRow.length-locateTableBodyRow.length 
    const lastRow = locateTableBodyRow[locateTableBodyRow.length - 1];
    for(let i=0;i<row;i++){
      const tr=document.createElement("tr")
      tr.innerHTML=`
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>`
      tbody.insertBefore(tr, lastRow);
    }
  }
}
const riskChartContainer=document.querySelector(".audit-chart-wrapper .risk-chart-wrapper #risk-chart-container");

function vwToPx(vw) {
    return (vw / 100) * window.innerWidth;
}

const riskChart=Highcharts.chart(riskChartContainer, {

    chart: {
        type: 'gauge',
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: '80%',
    },
    credits:{
      enabled:false,
    },
    title: {
        text: ''
    },

    pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: null,
    },

    yAxis: {
        min: 0,
        max: 100,
        tickWidth: 0,
        minorTickInterval: null,
        labels: {
          enabled:false,
        },
        lineWidth: 0,
        plotBands: [{
            from: 0,
            to: 50,
            color:  '#fe0000', 
            thickness: vwToPx(1.302),
            borderRadius: '0%'
        }, {
            from: 50,
            to: 75,
            color: ' #fed700', 
            thickness: vwToPx(1.302),
            borderRadius: '0%'
        }, {
            from: 75,
            to: 100,
            color: '#00af50', 
            thickness: vwToPx(1.302),
            borderRadius: '0%'
        }]
    },

    series: [{
        name: 'Speed',
        data: [80.4],
        tooltip: {
            enabled:false
        },
        dataLabels: {
          useHTML:true,
            format: '{y}',
            borderWidth: 0,
            color: '#333333',
             y: 1
        },
        dial: {
          radius: '85%',
          backgroundColor: '#333333',
          baseWidth:5,
          baseLength: '0%',
          rearLength: '-7%',
          borderWidth: 0,
          borderRadius: '50%'
        },
        pivot: {
          backgroundColor: '#333333',
          radius: 4,
          borderWidth: 0

        }
    }]
});


const mainChartContainer=document.querySelector(".audit-chart-wrapper .main-chart-wrapper #main-chart-container")
Highcharts.chart(mainChartContainer, {
    chart: {
        type: 'bubble',
        plotBorderWidth: 0,
        zooming: {
            type: 'xy'
        },
    },

    legend: {
        enabled: false
    },

    title: {
        text: ''
    },

    subtitle: {
        text: ''
    },

    accessibility: {
        point: {
            valueDescriptionFormat: '{index}. {point.name}, fat: {point.x}g, ' +
                'sugar: {point.y}g, obesity: {point.z}%.'
        }
    },

    xAxis: {
      min:10,
      max:150,
      tickInterval:10,
        gridLineWidth: 0,
        title: {
            text: 'Total Weighted Score',
            y:1
        },
        labels: {
            format: '{value}',
            useHTML:true,
        },
        tickWidth:0,
        lineWidth:0,
       
    },

    yAxis: {
      min:10,
      max:70,
      startOnTick: false,
      endOnTick: false,
        title: {
            text: 'Total Findings',
            x:-2
        },
        labels: {
            format: '{value}',
            useHTML:true,
        },
        maxPadding: 0.2,
        tickPixelInterval: vwToPx(3)                    
    },

    tooltip: {
        useHTML: true,
        headerFormat: '<table>',
        pointFormat: '<tr><th colspan="2"><h3>{point.country}</h3></th></tr>' +
            '<tr><th>Fat intake:</th><td>{point.x}g</td></tr>' +
            '<tr><th>Sugar intake:</th><td>{point.y}g</td></tr>' +
            '<tr><th>Obesity (adults):</th><td>{point.z}%</td></tr>',
        footerFormat: '</table>',
        followPointer: true
    },

    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                useHTML:true,
                format: '{point.name}'
            }

        }
    },

    series: [{
        data: [
            { x: 20, y: 60, z: 13.8, name: 'BE', country: 'Belgium'},
            { x: 18, y: 64, z: 14.7, name: 'DE', country: 'Germany'},
            { x: 30, y: 91.5, z: 15.8, name: 'FI', country: 'Finland'} ,
            { x: 70, y: 44, z: 12, name: 'NL', country: 'Netherlands'}, 
            { x: 60, y: 78, z: 11.8, name: 'SE', country: 'Sweden',} ,
            { x: 30, y: 56, z: 16.6, name: 'ES', country: 'Spain' },
            { x: 85, y: 43, z: 14.5, name: 'FR', country: 'France' },
            { x: 76, y: 27, z: 24.7, name: 'UK', country: 'United Kingdom' },
            { x: 64, y: 89, z: 16, name: 'RU', country: 'Russia' },
            {
                x: 65.5,
                y: 45,
                z: 35.3,
                name:
                    'US',
                country: 'United States'
            },
            { x: 116, y: 50, z: 28.5, name: 'HU', country: 'Hungary' },
            { x: 94, y: 51, z: 15.4, name: 'PT', country: 'Portugal' },
            { x: 104, y: 48, z: 31.3, name: 'NZ', country: 'New Zealand' }
        ],
  
    }],
    credits:{
      enabled:false
    },
    responsive: {
    rules: [{
        condition: {
            minWidth: 1500   
        },
        chartOptions: {
            chart: {
                spacing: [5, 5, 5, 5],   
                margin: [10, 10, 10, 10]
            },
            xAxis: {
                maxPadding: 0.05,
                minPadding: 0.05,
                labels: {
                    style: {
                        fontSize: '9px'
                    }
                }
            },
            yAxis: {
                maxPadding: 0.05,
                minPadding: 0.05,
                labels: {
                    style: {
                        fontSize: '9px'
                    }
                }
            },
            plotOptions: {
                bubble: {
                    minSize: 5,
                    maxSize: 20 
                }
            }
        }
    }] 
  }

});

//Findings Container
const findingmainChart=document.querySelector(".findings-outer-wrapper .findings-inner-wrapper .findings-chart-container #main-chart-container");

const findingMainLabels= ["Document Management", "Crew Management", "ghh", "ghgh", "ghghdg", "dfgd", "Document Management", "Crew Management", "ghh"];
const findingMainData = [14, 28, 19, 33, 23, 45, 14, 28, 19];
const findingColor=["#70ffb0","#70ffb0","#70ffb0","#70ffb0","#70ffb0","#ff7884","#f8c06d","#f8c06d","#f8c06d","#70ffb0"]
Highcharts.chart(findingmainChart, {
            chart: {
                polar: true,
                type: 'area'
            },
            title: {
                text: null
            },
            pane: {
                size: '70%'
            },
            xAxis: {
                categories: findingMainLabels,
                tickmarkPlacement: 'off',
                lineWidth: 0,
                labels: {
                  useHTML:true,
        
               formatter: function () {
                if (this.isLast) {
                    return ''; 
                }

                return `
                    <span>
                        <b style="color:${findingColor[this.pos]}">
                            ${findingMainData[this.pos]}
                        </b> 
                        ${findingMainLabels[this.pos]}
                    </span>
                `;
            }

                }
            },
            credits:{
              enabled:false,
            },
            yAxis: {
                lineWidth: 0,
                min: 10,
                max: 60,
                tickInterval:10
            },
            tooltip: {
                shared: true,
                pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y}</b><br/>'
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Score',
                data: findingMainData,
                pointPlacement: 'on',
                color: '#4682a7',
                fillColor: 'transparent',
                lineWidth: 2,
                marker: {
                    enabled: false,
                }
            }],
});

const findingSubChart=document.querySelector(".findings-outer-wrapper .findings-inner-wrapper .findings-chart-container #sub-chart-container");

Highcharts.chart( findingSubChart, {
    chart: {
        type: 'column',
    },

    title: {
        text: '',
        align: 'left',
    },

    xAxis: {
        categories: ['Certificate', 'Company Policy', 'Deck Equipment', 'Document'],
        labels:{
          useHTML: true,
          style: {
            align:'center',
            width: vwToPx(2.7),
            minWidth:'30px'
          }
        },
        lineWidth: 0,
    },
    credits:{
      enabled:false,
    },
    yAxis: {
        min: 0,
        max:60,
        title: '',
        gridLineColor: '#d1d1d1',
         labels:{
          useHTML:true,
          style:{
            align:'center'
          }
        },
        tickPixelInterval: vwToPx(3) 
    },

    legend: {
        enabled: false
    },

    plotOptions: {
        column: {
            stacking: 'normal',
            borderWidth: 0,
            pointPadding: 0.1,
            groupPadding: 0.15,
        },
    
        series: {
            dataLabels: {
                enabled: true,
                useHTML:true,
            },
            states: {
               inactive: {
                enabled: false
              },
                hover: {
                    enabled: false
                }
            },
          },
        },
    series: [
        {
            name: 'Red',
            color: '#ff7884',
            data: [28, 39, 8, 12]
        },
        {
            name: 'Orange',
            color: '#f8c06d',
            data: [17, 32, 22]
        },
        {
            name: 'Green',
            color: '#70ffb0',
            data: [9, 18, 17 ]
        }
    ]
});
const findingsLocationChart=document.querySelector(".findings-outer-wrapper .findings-inner-wrapper .findings-chart-container #location-chart-container");


Highcharts.chart( findingsLocationChart, {
    chart: {
        type: 'column',
        marginBottom: 60, 
    },

    title: {
        text: '',
    },

    xAxis: {
        categories: [
            "Accomodation",
            "CCR /Ship Office",
            "Engine Room",
            "Master's Office",
            "On Deck",
            "Steering Room",
            "Wheel House"
        ],
        labels:{
          useHTML: true,
        },
        lineWidth: 0,

    },
    credits:{
      enabled:false,
    },
    yAxis: {
        min: 0,
        max:60,
        tickInterval: 10,  
        title: '',
        gridLineColor: '#d1d1d1',
         labels:{
          useHTML:true,
        },

    },

    legend: {
        enabled: false
    },

    plotOptions: {
        column: {
            stacking: 'normal',
            borderWidth: 0,
            pointPadding: 0.1,
            groupPadding: 0.15,
            states: {
                hover: {
                    enabled: false
                }
            }
        },
    
        series: {
            dataLabels: {
                enabled: true,
                useHTML:true,
                style:{
                  color:"var(--input-val-color)"
                },
            },
          },
        },
    series: [
        {
            name: 'Red',
            data: [{
              y:2, color:'#f8c06d'},
             {
              y:19, color:'#ff7884'},
              {
              y:11, color:'#70ffb0'},
              {
              y:18, color:'#ff7884'},
              {
              y:33, color:'#f8c06d'},
              {
              y:8, color:'#f8c06d'},
              {
              y:18, color:'#f8c06d'},
            
              ]
        },
  
    ]
});
const weightedmainChart=document.querySelector(".weighted-outer-wrapper .weighted-inner-wrapper .weighted-chart-container #main-chart-container");
const weightedMainLabels=["Document Management","Crew Management","ghh","ghgh","ghghdg","dfgd","Document Management","Crew Management","ghh","fgfg"]
const weightedMainData=[14,28,19,33,23,45,14,28,19,33];
const weightedColor=["#00af50","#00af50","#00af50","#00af50","#00af50","#e73845","#ff9f1d","#ff9f1d","#ff9f1d","#00af50"]

Highcharts.chart(weightedmainChart, {
            chart: {
                polar: true,
                type: 'area'
            },
            title: {
                text: null
            },
            pane: {
                size: '60%'
            },
            xAxis: {
                categories: findingMainLabels,
                tickmarkPlacement: 'on',
                lineWidth: 0,
                labels: {
                  useHTML:true,
                   formatter: function () {
                if (this.isLast) {
                    return ''; 
                }

                return `
                    <span>
                        <b style="color:${weightedColor[this.pos]}">
                            ${weightedMainData[this.pos]}
                        </b> 
                        ${weightedMainLabels[this.pos]}
                    </span>
                `;
            }
        
                }
            },
            credits:{
              enabled:false,
            },
            yAxis: {
                lineWidth: 0,
                min:10,
                max: 60,
                tickInterval:10
            },
            tooltip: {
                shared: true,
                pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y}</b><br/>'
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Score',
                data: findingMainData,
                pointPlacement: 'off',
                 color: '#4682a7',
                fillColor: 'transparent',
                lineWidth: 2,
                marker: {
                    enabled: false,
                }
            }],
});

const weightedSubChart=document.querySelector(".weighted-outer-wrapper .weighted-inner-wrapper .weighted-chart-container #sub-chart-container");
Highcharts.chart( weightedSubChart, {
    chart: {
        type: 'column',
    },

    title: {
        text: '',
        align: 'left',
    },

    xAxis: {
        categories: ['Certificate', 'Company Policy', 'Deck Equipment', 'Document'],
        labels:{
          useHTML: true,
          style: {
            align:'center',
            width: vwToPx(2.7),
            minWidth:'30px'
          }
        },
        lineWidth: 0,
    },
    credits:{
      enabled:false,
    },
    yAxis: {
        min: 0,
        max:60,
        title: '',
        gridLineColor: '#d1d1d1',
         labels:{
          useHTML:true,
          style:{
            align:'center'
          }
        },
        tickPixelInterval: vwToPx(3) 
    },

    legend: {
        enabled: false
    },

    plotOptions: {
        column: {
            stacking: 'normal',
            borderWidth: 0,
            pointPadding: 0.1,
            groupPadding: 0.15,
        },
    
        series: {
            dataLabels: {
                enabled: true,
                useHTML:true,
            },
            states: {
               inactive: {
                enabled: false
              },
                hover: {
                    enabled: false
                }
            },
          },
        },
    series: [
        {
            name: 'Red',
            color: '#e73845',
            data: [28, 39, 8, 12]
        },
        {
            name: 'Orange',
            color: '#ff9f1d',
            data: [17, 32, 22]
        },
        {
            name: 'Green',
            color: '#00af50',
            data: [9, 18, 17 ]
        }
    ]
});

const weightedLocationChart=document.querySelector(".weighted-outer-wrapper .weighted-inner-wrapper .weighted-chart-container #location-chart-container");

Highcharts.chart( weightedLocationChart, {
    chart: {
        type: 'column',
        marginBottom: 60, 
    },

    title: {
        text: '',
    },

    xAxis: {
        categories: [
            "Accomodation",
            "CCR /Ship Office",
            "Engine Room",
            "Master's Office",
            "On Deck",
            "Steering Room",
            "Wheel House"
        ],
        labels:{
          useHTML: true,
        },
        lineWidth: 0,

    },
    credits:{
      enabled:false,
    },
    yAxis: {
        min: 0,
        max:60,
        tickInterval: 10,  
        title: '',
        gridLineColor: '#d1d1d1',
         labels:{
          useHTML:true,
        },

    },

    legend: {
        enabled: false
    },

    plotOptions: {
        column: {
            stacking: 'normal',
            borderWidth: 0,
            pointPadding: 0.1,
            groupPadding: 0.15,
            states: {
                hover: {
                    enabled: false
                }
            }
        },
    
        series: {
            dataLabels: {
                enabled: true,
                useHTML:true,
                style:{
                  color:"var(--input-val-color)"
                },
            },
          },
        },
    series: [
        {
            name: 'Red',
             data: [{
              y:2, color:'#f8c06d', dataLabels: { style: { color: 'var(--input-val-color)' } ,},
          },
             {
              y:19, color:'#e73845',dataLabels: { style: { color: 'white' } ,},},
              {
              y:11, color:'#ff9f1d',dataLabels: { style: { color: 'var(--input-val-color)' } ,},},
              {
              y:18, color:'#e73845',dataLabels: { style: { color: 'white' } ,},},
              {
              y:33, color:'#00af50',dataLabels: { style: { color: 'white' } ,},},
              {
              y:8, color:'#e73845',dataLabels: { style: { color: 'white' } ,},},
              {
              y:18, color:'#00af50',dataLabels: { style: { color: 'white' } ,},},
            
              ]
        },
  
    ]
});


const duration = 1000; 

function animate(timestamp) {
  if(!start) start = timestamp;

  let progress = Math.min((timestamp - start) / duration * 100, 100);

  loaderLabel.textContent = `${Math.floor(progress)}%`;

  if (progress < 100) {
    requestAnimationFrame(animate);
  }
}



function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}



removeBtn.addEventListener('click',(e)=>{
  e.preventDefault();
  filePreview.classList.remove("active")
})

const dateTexts=auditForm.querySelectorAll(".date-text");

const calendarDays = document.querySelectorAll(".custom-date-day");

calendarDays.forEach(dayBtn => {
  dayBtn.addEventListener("click", () => {
    
    let day = Number(dayBtn.dataset.day);
    let month = Number(dayBtn.dataset.month);
    let year = Number(dayBtn.dataset.year);

    let selectedDate = new Date(year, month - 1, day);

  });
});

function padZero(num){
  if(num > 9){
    return num;
  }
  else{
    return "0"+num;
  }
}
let flag=0;
let selectedMonth;
let selectedDatee;
let selectedYear;
 const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
function createDatepicker(datePicker) {

  const monthNameEl = datePicker.querySelector(".month-name");
  const datesContainer = datePicker.querySelector(".dates");
  const prevBtn = datePicker.querySelector(".prev-month");
  const nextBtn = datePicker.querySelector(".next-month");
  const tags = datePicker.querySelectorAll(".tag");

  let today = new Date();

  let current = new Date(today);

  let selectedDate = null;

 

  function renderCalendar() {
    const year = current.getFullYear();
    const month = current.getMonth();

    monthNameEl.textContent = `${MONTHS[month]} ${year}`;
    datesContainer.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    let days = [];

    for (let i = firstDay; i > 0; i--) {
      days.push({
        day: prevLastDate - i + 1,
        faded: true,
        date: new Date(year, month - 1, prevLastDate - i + 1)
      });
    }

    for (let i = 1; i <= lastDate; i++) {
      days.push({
        day: i,
        faded: false,
        date: new Date(year, month, i)
      });
    }

    const nextDays = 42 - days.length;
    for (let i = 1; i <= nextDays; i++) {
      days.push({
        day: i,
        faded: true,
        date: new Date(year, month + 1, i)
      });
    }

    days.forEach((d, index) => {
      const btn = document.createElement("button");
      btn.classList.add("date");
      btn.type = "button";
      btn.textContent = d.day;
      
      if (d.faded) btn.classList.add("faded");
       if (d.date.toDateString() === today.toDateString() &&
        !btn.classList.contains("current-date") 
      ) {
       
        if(!btn.classList.contains("faded")){
           btn.classList.remove("current-day")
          btn.classList.add("current-date");

        }
        
      }
      if (d.date.toDateString() === today.toDateString() && selectedDate === null) {
        if(!btn.classList.contains("faded")){
          btn.classList.add("current-day");
        }
        
      }


      if (selectedDate && d.date.toDateString() === selectedDate.toDateString()) {
        if(!btn.classList.contains("faded")){
          btn.classList.add("current-day"); 
        }
      }
     
      btn.addEventListener("click", () => {
        const allButtons = datesContainer.querySelectorAll(".date");
        selectedDate = d.date;

        if (flag === 0) {
          allButtons.forEach(b => b.classList.remove("current-date"));

          allButtons.forEach((b, i) => {
            if (b.classList.contains("current-day")) {
              const btnDate = days[i].date;
              if (
                btnDate.getMonth() === current.getMonth() &&
                btnDate.getFullYear() === current.getFullYear()
              ) {
                b.classList.remove("current-day");
                b.classList.add("current-date");
              }
            }
          });

          flag = 1; 
        }

        allButtons.forEach(b => b.classList.remove("current-day"));
        btn.classList.add("current-day");

      
        datePicker.dataset.value = selectedDate.toISOString().split("T")[0];
        getSelectedDate(datePicker)
        validDateInput(datePicker)
      });

      datesContainer.appendChild(btn);
    });

  }

    prevBtn.addEventListener("click", () => {
      current.setMonth(current.getMonth() - 1);
      renderCalendar();
    });

    nextBtn.addEventListener("click", () => {
      current.setMonth(current.getMonth() + 1);
      renderCalendar();
    });

    tags.forEach(tag => {
      tag.addEventListener("click", () => {
        let type = tag.dataset.type;

        if (type === "today") selectedDate = new Date();
        if (type === "yesterday") selectedDate = new Date(Date.now() - 86400000);
        if (type === "tomorrow") selectedDate = new Date(Date.now() + 86400000);

          current = new Date(selectedDate);
          renderCalendar();
      });
    });
  renderCalendar();
}

const datepickers=auditForm.querySelectorAll(".datepicker");

datepickers.forEach(datePicker=>{
  createDatepicker(datePicker)
  // getSelectedDate(datePicker);
})

function getSelectedDate(datePicker){
   const monthNameEl=datePicker.querySelector(".month-name")
  const MonthArr=monthNameEl.textContent.split(" ")
    selectedMonth=Number(MONTHS.findIndex(m => m === MonthArr[0]))+1
    selectedMonth=padZero(selectedMonth)
      const dates=datePicker.querySelectorAll(".dates .date");
      dates.forEach(d=>{
      if(d.classList.contains("current-day")){
        selectedDatee=padZero(Number(d.textContent))
      }
    })
    selectedYear=Number(MonthArr[1])

    const parentEl=datePicker.parentElement;
    const dateInp=parentEl.querySelector(".date-input");
    dateInp.value=`${selectedDatee}/${selectedMonth}/${selectedYear}`;
    const dateText=parentEl.querySelector(".date-text");
    dateText.childNodes[0].textContent=`${selectedDatee}/${selectedMonth}/${selectedYear}`;
}

function  validDateInput(datePicker){
  const parentEl=datePicker.parentElement;
  const dateInp=parentEl.querySelector(".date-input");
  const inputWrapper = dateInp.parentElement;
  const errorElement = inputWrapper.querySelector(".error");
  if(dateInp.value==""){
    inputWrapper.classList.add("error");
  } else {
    inputWrapper.classList.remove("error");
  }
}


dateTexts.forEach(dateText => {
  dateText.addEventListener("click", () => {
    const parentContainer = dateText.parentElement;
    const datePicker = parentContainer.querySelector(".datepicker");

    datePicker.classList.toggle("active");

    datePicker._trigger = dateText;
  });
});

document.addEventListener("click", (e) => {
  document.querySelectorAll(".datepicker.active").forEach(dp => {
    const trigger = dp._trigger;

    if (!trigger.contains(e.target) && !dp.contains(e.target)) {
      dp.classList.remove("active");
    }
  });
});




const formWrapper=document.querySelector(".audit-form-outer-wrapper");

const chartWrapper=document.querySelector(".audit-chart-wrapper");


const submitFormBtn=document.querySelector(".audit-form-outer-wrapper .audit-form-btn-container .submit-btn")
const cancelFormBtn=document.querySelector(".audit-form-outer-wrapper .audit-form-btn-container .cancel-btn")


const auditInputs=auditForm.querySelectorAll("input,select")



function validateAuditForm(){
  let isValid = true;

  auditInputs.forEach((input) => {
    const value = input.value.trim();
    const inputWrapper = input.closest(".input-wrapper");
    if (!inputWrapper) {
      return;
    }

    const errorElement = inputWrapper.querySelector(".error");
      if (value === "") {
        isValid=false;
        inputWrapper.classList.add("error");
      } 
      else {
        inputWrapper.classList.remove("error");
      }
  });

  return isValid;
}
auditInputs.forEach(input=>{
  input.addEventListener('input',()=>{
    if (validateAuditForm()) {
      const inputWrapper=input.closest(".input-wrapper");
      inputWrapper.classList.remove("error");
    }
  })
})

auditInputs.forEach(inp=> {
  if(inp.id==="imo_number"){
      inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/[^0-9]/g, "");
    });
  }
  if(inp.id==="size"){
      inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/[^0-9]/g, "");
    })
  }
   
})
submitFormBtn.addEventListener('click',(e)=>{
  e.preventDefault();
  if (validateAuditForm()) {
    const auditData  = getAuditData();
    sessionStorage.setItem("auditData",JSON.stringify(auditData));
    delFormData()
    formWrapper.classList.add("not-active");
    chartWrapper.classList.add("active");
    mainLogo.classList.add("active");

    displayFormData();
  }
})

cancelFormBtn.addEventListener("click",()=>{
  delFormData()

})

function delFormData(){
  auditForm.reset();
  auditInputs.forEach(input=>{
    const inputWrapper=input.closest(".input-wrapper");
    inputWrapper.classList.remove("error");
  })
  selectInputs.forEach(select=>{
    const selectedItem=select.querySelector(".selected-item")
    const options=select.querySelectorAll("li");
    options.forEach(opt=>{
      opt.classList.remove("active");
    })
    selectedItem.childNodes[0].textContent=selectedItem.dataset.select
  })
  datepickers.forEach(datePicker=>{
    createDatepicker(datePicker)
    getSelectedDate(datePicker);
  })
  dateTexts.forEach(dateText=>{
    dateText.childNodes[0].textContent="dd/mm/yyyy"
  })
  
  filePreview.classList.remove("active");
}


function getAuditData() {
  const auditFormData = {};
  auditInputs.forEach((input) => {
    if (input.value.trim() !== "") {
      auditFormData[input.name] = input.value.trim();
    }
  });
  return auditFormData;
}

const closeChartBtn=document.querySelector(".chart-header-btn-container .close-chart-btn");

closeChartBtn.addEventListener('click',()=>{
  mainLogo.classList.remove("active")
    chartWrapper.classList.remove("active");
    formWrapper.classList.remove("not-active");
})

const chartHeader=chartWrapper.querySelector(".audit-chart-header-wrapper .chart-header");
const imoText=chartWrapper.querySelector(".imo-number")
const formContentTexts=chartWrapper.querySelectorAll(".audit-form-content-wrapper .audit-form-content-container .form-content-text")

function displayFormData(){
  if(sessionStorage.getItem("auditData")){
    const auditData=JSON.parse(sessionStorage.getItem("auditData"));
  
    for(let key in auditData){
      if(key==="Vessel Name"){
        chartHeader.textContent=auditData["Vessel Name"]
      }
      else if(key==="IMO Number"){
        imoText.textContent=auditData["IMO Number"]
      }
      else{
        formContentTexts.forEach(text=>{
          const span=text.querySelector("span")
      
          const spanData=span.getAttribute("data-formVal");
        
          if(spanData==key){
            span.textContent=auditData[key]
          }
        })
      }
    }
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  displayFormData()
})
