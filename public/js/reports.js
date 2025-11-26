// ==========================
// REPORTS — Frontend Script (Synced with reports.ejs)
// ==========================

// Load data on page ready
document.addEventListener("DOMContentLoaded", loadReportsFromDB);

// ELEMENTS
const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");
const tableBody = document.getElementById("tableBody");
const selectAll = document.getElementById("selectAll");

// -------------------------------
// LOAD ALL REPORTS FROM BACKEND
// -------------------------------
async function loadReportsFromDB() {
    try {
        const res = await fetch("/reports/data");
        const reports = await res.json();

        tableBody.innerHTML = "";
        reports.forEach(addRowToTable);
    } catch (err) {
        console.error("Failed to load reports", err);
    }
}

// -------------------------------
// ADD NEW REPORT (SAVE)
// -------------------------------
document.getElementById("saveReportBtn").addEventListener("click", async () => {
    const formData = new FormData();
    formData.append("name", document.getElementById("r_name").value);
    formData.append("type", document.getElementById("r_type").value);
    formData.append("category", document.getElementById("r_category").value);
    formData.append("date", document.getElementById("r_date").value);
    formData.append("doctor", document.getElementById("r_doctor").value);
    formData.append("file", document.getElementById("fileUpload").files[0]);

    const res = await fetch("/reports/add", {
        method: "POST",
        body: formData
    });

    if (res.ok) {
        alert("Report saved successfully!");
        closeAddReportModal();
        loadReportsFromDB();
    } else {
        alert("Error: Could not save report");
    }
});

// -------------------------------
// ADD ROW TO TABLE
// -------------------------------
function addRowToTable(report) {
    const row = document.createElement("tr");
    row.dataset.id = report._id;

    row.innerHTML = `
        <td><input type="checkbox" class="row-checkbox"></td>
        <td>${report.name}</td>
        <td>${report.type}</td>
        <td>${report.category}</td>
        <td>${report.date}</td>
        <td>${report.doctor}</td>
        <td><span class="file-tag">${report.type}</span></td>
        <td><button class="viewBtn">View</button></td>
        <td><button class="deleteBtn">Delete</button></td>
    `;

    tableBody.appendChild(row);
}

// -------------------------------
// VIEW + DELETE HANDLERS
// -------------------------------
tableBody.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    const id = row.dataset.id;

    // VIEW REPORT (Correct path)
    if (e.target.classList.contains("viewBtn")) {
        const iframeUrl = `/uploads/reports/${id}`;
        document.getElementById("modalContent").innerHTML =
            `<iframe src="${iframeUrl}" width="100%" height="520px" style="border:none;"></iframe>`;
        openViewModal();
    }

    // DELETE REPORT
    if (e.target.classList.contains("deleteBtn")) {
        if (confirm("Are you sure you want to delete this report?")) {
            await fetch(`/reports/delete/${id}`, { method: "DELETE" });
            row.remove();
        }
    }
});

// -------------------------------
// VIEW MODAL CONTROLS
// -------------------------------
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
});

function openViewModal() {
    document.getElementById("modal").style.display = "flex";
}

// -------------------------------
// ADD REPORT MODAL CONTROLS
// -------------------------------
document.getElementById("addReportBtn").addEventListener("click", () => {
    document.getElementById("addReportModal").style.display = "flex";
});

document.getElementById("closeAddReport").addEventListener("click", closeAddReportModal);

function closeAddReportModal() {
    document.getElementById("addReportModal").style.display = "none";
}

// -------------------------------
// SEARCH & FILTER
// -------------------------------
searchBox.addEventListener("input", filterTable);
categoryFilter.addEventListener("change", filterTable);

function filterTable() {
    const search = searchBox.value.toLowerCase();
    const cat = categoryFilter.value;

    tableBody.querySelectorAll("tr").forEach(row => {
        const name = row.cells[1].innerText.toLowerCase();
        const category = row.cells[3].innerText;

        const matchSearch = name.includes(search);
        const matchCat = cat === "all" || category === cat;

        row.style.display = matchSearch && matchCat ? "" : "none";
    });
}

// -------------------------------
// SELECT ALL CHECKBOX LOGIC
// -------------------------------
selectAll.addEventListener("change", () => {
    const status = selectAll.checked;
    document.querySelectorAll(".row-checkbox").forEach(cb => cb.checked = status);
});

// -------------------------------
// QR GENERATION (WORKING VERSION)
// -------------------------------
document.getElementById("profileQrBtn").addEventListener("click", () => {
    const qrModal = document.getElementById("qrModal");
    const container = document.getElementById("qrContainer");

    // Clear previous QR
    container.innerHTML = "";

    // Full access URL
    const qrData = `${window.location.origin}/records`;

    // Generate QR
    new QRCode(container, {
        text: qrData,
        width: 220,
        height: 220,
        colorDark: "#000",
        colorLight: "#fff"
    });

    qrModal.style.display = "flex";
});

// Close QR modal
document.getElementById("closeQR").addEventListener("click", () => {
    document.getElementById("qrModal").style.display = "none";
});

// -------------------------------
// SHARE SELECTED BUTTON
// -------------------------------
document.getElementById("shareSelectedBtn").addEventListener("click", () => {
    const selected = [...document.querySelectorAll(".row-checkbox")].filter(cb => cb.checked);

    if (selected.length === 0) {
        alert("Select at least one report to share.");
        return;
    }

    alert(`Sharing ${selected.length} report(s)... Feature coming soon!`);
});
