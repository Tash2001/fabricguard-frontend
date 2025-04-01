// const { error } = require("console");
// Automatically switch between localhost and LAN IP
const BACKEND_URL = location.hostname.includes("github.io")
    ? "http://192.168.1.3:8000"  
    : "http://127.0.0.1:8000";



function fetchScanPage(){
    fetch('${BACKEND_URL}/upload')
        .then(response=>{
            if(!response.ok){
                throw new Error("Fail to upload page");
            }
            return response.text();
        })
        .then(html=>{
            document.body.innerHTML=html;
        }).catch(error=>{
            console.error("error loading upload page",error);
        });
}

function fetchDashboardPage() {
    fetch('${BACKEND_URL}/dashboard')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load dashboard page");
            }
            return response.text();
        })
        .then(html => {
            document.body.innerHTML = html;

            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            } else {
                console.warn("loadDashboardData is not defined.");
            }
        })
        .catch(error => {
            console.error("Error loading dashboard page", error);
        });
}

function fetchHomePage(){
    fetch('${BACKEND_URL}/')
    .then(response=>{
        if(!response.ok){
            throw new Error("Fail to upload page");
        }
        return response.text();
    })
    .then(html=>{
        document.body.innerHTML=html;
    }).catch(error=>{
        console.error("error loading home page", error);
    });

}