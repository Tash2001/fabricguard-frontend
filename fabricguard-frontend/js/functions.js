// Automatically switch between localhost and LAN IP
const BACKEND_URL = location.hostname.includes("github.io")
    ? "http://192.168.1.42:8000" 
    : "http://127.0.0.1:8000";


AOS.init();
console.log(" functions.js loaded");

let analysisType = "";

const resultMapping = {
    hole: { name: "Hole Defect Detected", icon: "bi-exclamation-triangle-fill", color: "text-danger" },
    no_defect: { name: "No Defect Detected", icon: "bi-emoji-smile-fill", color: "text-success" },
    stain: { name: "Stain Detected", icon: "bi-exclamation-triangle-fill", color: "text-danger" },
    tear: { name: "Tear Defect Detected", icon: "bi-exclamation-triangle-fill", color: "text-danger" },
    thread: { name: "Thread Defect Detected", icon: "bi-exclamation-triangle-fill", color: "text-danger" },

    cotton: { name: "Cotton", icon: "bi-check-circle-fill", color: "text-success" },
    denim: { name: "Denim", icon: "bi-check-circle-fill", color: "text-success" },
    leather: { name: "Leather", icon: "bi-check-circle-fill", color: "text-success" },
    silk: { name: "Silk", icon: "bi-check-circle-fill", color: "text-success" },
    velvet: { name: "Velvet", icon: "bi-check-circle-fill", color: "text-success" }

};
function closeOffcanvas() {
    let offcanvasElement = document.querySelector("#top-navbar");
    let bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
    if (bsOffcanvas) {
      bsOffcanvas.hide();
    }
  }

// Function to handle analysis type selection
function selectAnalysis(type) {
    const uploadArea = document.getElementById("upload-area");
    const uploadHeading = document.getElementById("upload-heading");
    const chooseFileButton = document.querySelector(".chooseFileButton");
    clearResults();

    if (analysisType && analysisType !== type) {
        Swal.fire({
            title: "Confirm Change",
            text: "Switching the analysis type will reset your uploaded image. Do you want to proceed?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4CAF50",
            cancelButtonColor: "#d9534f",
            confirmButtonText: "Yes, Switch",
            cancelButtonText: "No, Keep It"
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById("imageUpload").value = "";
                document.getElementById("image-preview").innerHTML = "";
                document.getElementById("scanButton").style.display = "none";
                updateSelection(type);
            }
        });
    } else {
        updateSelection(type);
    }
}

function updateSelection(type) {
    analysisType = type;
    const uploadHeading = document.getElementById("upload-heading");

    uploadHeading.innerText =
        type === "defect"
            ? "Upload Image for Defect Detection"
            : "Upload Image for Texture Analysis";

    document.getElementById("upload-area").style.pointerEvents = "auto";
    document.getElementById("upload-area").style.opacity = "1";
    document.querySelector(".chooseFileButton").disabled = false;
}


// Function to handle image upload and preview
function handleImage(input) {
    const file = input.files[0];
    const previewContainer = document.getElementById("image-preview");
    const scanButton = document.getElementById("scanButton");

    previewContainer.innerHTML = ""; 
    if (file) {
        const allowedTypes = ["image/png", "image/jpeg"];

        if (!allowedTypes.includes(file.type)) {
            Swal.fire({
                icon: "error",
                title: "Invalid File Type",
                text: "Only PNG and JPG images are allowed!",
                confirmButtonColor: "#4CAF50"
            });
            input.value = ""; 
            scanButton.style.display = "none";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = "Uploaded Fabric Image";
            img.style.maxWidth = "300px";
            img.style.maxHeight = "300px";
            img.style.borderRadius = "10px";
            img.style.objectFit = "cover";
            img.classList.add("shadow-lg");

            img.style.opacity = "0";
            previewContainer.appendChild(img);
            setTimeout(() => {
                img.style.opacity = "1";
                img.style.transition = "opacity 0.3s ease-in-out";
            }, 50);

            scanButton.style.display = "inline-block";
            scanButton.classList.add("animate__animated", "animate__fadeInUp");
        };
        reader.readAsDataURL(file);
    } else {
        scanButton.style.display = "none";
    }
}

// scan the image
function scanImage() {
    const imageInput = document.getElementById("imageUpload");

    if (!imageInput.files.length) {
        Swal.fire({
            title: "No Image Selected",
            text: "Please upload an image before scanning.",
            icon: "error",
            confirmButtonColor: "#4CAF50"
        });
        return;
    }

    const formData = new FormData();
    formData.append("file", imageInput.files[0]);

    // Determine API endpoint based on analysis type
    let apiEndpoint = analysisType === "defect" ? "/predict" : "/texture-analysis";

    // Show loading in result section
    const resultCard = document.getElementById("result-card");
    const resultContent = document.getElementById("result-content");

    resultCard.style.display = "block";
    resultContent.innerHTML = `<div class="col-12 text-center">
                                  <div class="spinner-border text-success" role="status">
                                      <span class="visually-hidden">Loading...</span>
                                  </div>
                                  <p class="mt-2">Analyzing your image...</p>
                              </div>`;

    // Send the image to the backend for processing
    fetch("${BACKEND_URL}",apiEndpoint, {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log("Received response:", data);
            let resultKey = data.class.toLowerCase();
            let resultInfo = resultMapping[resultKey] || { name: "Unknown", icon: "bi-question-circle-fill", color: "text-muted" };
            resultContent.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-4 text-center">
                        <i class="bi ${resultInfo.icon} ${resultInfo.color} display-1"></i>
                    </div>
                    <div class="col-md-8">
                        <h3 class="fw-bold ${resultInfo.color}">${resultInfo.name}</h3>
                        <p class="fs-5"><strong>Confidence:</strong> <span class="text-info">${data.confidance}</span></p>
                        <a href="${BACKEND_URL}/download-report/${data.scan_id}" target="_blank" class="btn btn-outline-primary mt-3">
                            <i class="bi bi-download"></i> Download Report
                        </a>
                    </div>
                </div>
            `;

            resultCard.classList.add("animate_animated", "animate_fadeInUp");
        })
        .catch(error => {
            resultContent.innerHTML = `<p class="text-center text-danger">Error processing image. Please try again.</p>`;
            console.error(error);
        });
}

function clearResults() {
    document.getElementById("imageUpload").value = "";
    document.getElementById("image-preview").innerHTML = "";
    document.getElementById("scanButton").style.display = "none";
    document.getElementById("result-card").style.display = "none";
}



// dashboard
function loadDashboardData() {
    console.log("Fetching dashboard data...");
    fetch("${BACKEND_URL}/dashboard-data")
        .then(response => response.json())
        .then(data => {
            createChart("dailyChart", data.daily);
            createChart("weeklyChart", data.weekly);
            createChart("monthlyChart", data.monthly);
            const topList = document.getElementById("topClassesList");
            topList.innerHTML = "";
            data.top_classes.forEach(c => {
                topList.innerHTML += `<tr>
                    <td>${c.class}</td>
                    <td>${c.count}</td>
                </tr>`;
            });

            const table = document.getElementById("latestScansTable");
            table.innerHTML = "";
            data.latest.forEach(r => {
                table.innerHTML += `<tr>
                    <td>${r.id}</td>
                    <td>${r.image_name}</td>
                    <td>${r.type}</td>
                    <td>${r.class}</td>
                    <td>${r.confidence.toFixed(2)}</td>
                    <td>${r.timestamp}</td>
                </tr>`;
            });
        })
        .catch(error => {
            console.error("Failed to load dashboard data:", error);
        });
}

// function reportSummary(){
//     fetch("/download-analytics-report")
//     .then(response=>response.json())
//     .catch(error=>{
//         console.error("Failed to load report summary:",error);
//     });
// }


function createChart(canvasId, dataset) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Defect', 'Texture'],
            datasets: [{
                label: 'Scans',
                data: [dataset.defect, dataset.texture],
                backgroundColor: ['#143D60', '#4394E5']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

