const API_URL = "http://localhost:3309/api/v1"; 

// Function to Upload File
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        alert("Please select a file");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const response = await fetch(`/api/v1/upload-edf`, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    document.getElementById('message').innerText = result.message;
}

// Function to Fetch Files List
async function fetchFiles() {
    const response = await fetch(`/api/v1/files-lists`,{
      method: "POST",
      body: {}
    });

    const files = await response.json();
    const table = document.getElementById("fileTable");
    table.innerHTML = "";
    const fileData = files.data.files

    if(fileData.length > 0) {
        fileData.forEach(file => {
            const row = `<tr>
                <td>${file.file_name}</td>
                <td><a href="viewer.html?id=${file.id}" class="btn">View</a></td>
            </tr>`;
            table.innerHTML += row;
        });
    
    } else {
        const row = `<tr>
            <td>No Data Found</td>
        </tr>`;
        table.innerHTML += row;
    }
}

// Fetch files if on the file list page
if (window.location.pathname.includes("files.html")) {
    fetchFiles();
}

// Function to Fetch ECG Data and Render Chart
async function fetchECGData() {
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('id');

    if (!fileId) {
        alert("Invalid File ID");
        return;
    }

    const response = await fetch(`${API_URL}/file/${fileId}`);
    const ecgData = await response.json();

    plotECG(ecgData);
}

// Function to Plot ECG Using Chart.js
function plotECG(data) {
    const ctx = document.getElementById('ecgChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.timestamps,
            datasets: [{
                label: 'ECG Signal',
                data: data.values,
                borderColor: 'red',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Time (s)' } },
                y: { title: { display: true, text: 'Amplitude' } }
            }
        }
    });
}

// Call Fetch ECG Data Function if on Viewer Page
if (window.location.pathname.includes("viewer.html")) {
    fetchECGData();
}

// Dummy Navigation Functions (For Previous/Next Segments)
function prevSegment() {
    alert("Previous segment clicked! Implement navigation logic here.");
}

function nextSegment() {
    alert("Next segment clicked! Implement navigation logic here.");
}
``