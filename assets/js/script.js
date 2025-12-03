const header=document.querySelector("header");
const menuBar=document.querySelector(".menubar")
const menuBtn=menuBar.querySelector(".menu-btn");
const main=document.querySelector("main");
const mainLogo= menuBar.querySelector(".logo");

let menuOpen = true;

function getLeftMargin() {
  let vw = document.documentElement.clientWidth;
    // return vw <= 1024 ? 178 :
    // vw <= 1400 ? 236 :
    // vw <= 1600 ? 278 : 333;
  return 333;
}

function applyLayout() {
  const leftMargin = getLeftMargin();
  main.style.marginLeft = menuOpen ? `${leftMargin}px` : "0";
  header.style.left = menuOpen ? "0" : "-100%";
}

menuBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  applyLayout();
});

window.addEventListener('resize', applyLayout);

applyLayout();

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
      })
    })
  })
   document.addEventListener("click", (e) => {
    if (!select.contains(e.target)) {
      select.classList.remove("active");
      selectInputs.forEach(select=>{
      const selectedItem=select.querySelector(".selected-item")
      selectedItem.querySelector("img").classList.remove("active");
    })
    }
  });
})

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
const removeBtn = filePreview.querySelector(".remove-file");

console.log(removeBtn)
fileInput.accept = ".xlsx, .xls";
browseBtn.addEventListener("click",()=>{
  fileInput.click(); 
  fileInput.type="file"
 
  fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
    if (!file) return;
 
    const allowed = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"];

  if (!allowed.includes(file.type)) {
    fileInput.value = ""; 
    return;
  }

  filePreview.classList.add("active");
  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  let formatted = formatSize(file.size);
  const sizeMB = file.size / (1024 * 1024);        
  const sizeText = sizeMB.toFixed(2);               
  fileInfo.textContent = `${file.name} (${sizeText} MB)`;
  fileInfo.textContent = `${file.name.slice(-10)} (${formatted})`;


  Highcharts.chart("progressChart", {
    chart: {
      type: "solidgauge",
      height: "65",
      width: "65",
      backgroundColor: "transparent"
    },
    title: null,
    pane: {
      center: ["50%", "50%"],
      size: "100%",
      startAngle: 0,
      endAngle: 360,
      background: {
        outerRadius: "100%",
        innerRadius: "85%",
        borderWidth: 0,
        backgroundColor: "#b1b1b1"
      }
    },
    tooltip: { enabled: false },
    credits:{enabled:false},
    yAxis: {
      min: 0,
      max: 100,
      lineWidth: 0,
      tickPositions: []
    },
    accessibility:{enabled:false},
    plotOptions: {
      solidgauge: {
        rounded:true,
        innerRadius: "85%",
        dataLabels: {
          useHTML: true,
          borderWidth: 0,
          enabled: true,
           formatter: function () {
              return `
            <div style=" 
                font-size: 12px;
                text-align: center;
                position: relative;
                top:13px;
                color:"#457B9D";
            ">
                ${Math.round(this.y)}%
            </div>`
            }
          }
      }
    },

    series: [{
      data: [{
        color: "#011627",
        radius: '100%',
        innerRadius: '85%',
        y: 0 
      }]
    }]
  },function (chart) {
    setTimeout(() => {
      chart.series[0].points[0].update(76);
    }, 200);
  })
})
})

removeBtn.addEventListener('click',(e)=>{
  e.preventDefault();
  filePreview.classList.remove("active")
})

const dateTexts=auditForm.querySelectorAll(".date-text");

// function formatDMY(dateObj) {
//   let d = String(dateObj.getDate()).padStart(2, "0");
//   let m = String(dateObj.getMonth() + 1).padStart(2, "0");
//   let y = dateObj.getFullYear();
//   return `${d}/${m}/${y}`;
// }


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
function createDatepicker(datePicker) {

  const monthNameEl = datePicker.querySelector(".month-name");
  const datesContainer = datePicker.querySelector(".dates");
  const prevBtn = datePicker.querySelector(".prev-month");
  const nextBtn = datePicker.querySelector(".next-month");
  const tags = datePicker.querySelectorAll(".tag");

  let today = new Date();
  let current = new Date(today);
  let selectedDate = null;

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
  getSelectedDate(datePicker);
})

function getSelectedDate(datePicker){
   const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
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
        isValid=true;
        inputWrapper.classList.add("error");
      } else {
        inputWrapper.classList.remove("error");
      }
  });

  return isValid;
}
submitFormBtn.addEventListener('click',(e)=>{
  e.preventDefault();
  if (validateAuditForm()) {
    const auditData  = getAuditData();
    sessionStorage.setItem("auditData",JSON.parse(auditData));
    auditInputs.forEach(input=>{
    const inputWrapper=input.closest(".input-wrapper");
    inputWrapper.classList.remove("error");
    })
    formWrapper.classList.add("not-active");
    chartWrapper.classList.add("active");
    mainLogo.classList.add("active");

    displayFormData();
  }
})

cancelFormBtn.addEventListener("click",()=>{
  auditForm.reset();
  sessionStorage.removeItem("auditData")
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

})

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

