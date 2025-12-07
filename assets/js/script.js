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


 const storedData = sessionStorage.getItem("excelData");
if (storedData) {
  const data = JSON.parse(storedData); 
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
  for(let key in obj){
    let low=0;
    low+=obj[key].low;
    let medium=0;
    medium+=obj[key].low;
    let high=0;
    high+=obj[key].low;
    obj["Grand Total"]={"low":low,"medium":medium,"high":high}
  }
  const catArr=Object.entries(obj).map(([cat,risk])=>({

    "category":cat,
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
  catTable.innerHTML=`
  <thead>
    <tr>
      <th rowspan="2">Category</th>
      <th colspan="4" style="text-align: center;">POTENTIAL RISKS FINDINGS COUNT</th>
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

