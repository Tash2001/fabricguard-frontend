// const { error } = require("console");

function fetchScanPage(){
    fetch('/upload')
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
    fetch('/dashboard')
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
    fetch('/')
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