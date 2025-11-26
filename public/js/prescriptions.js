// ==========================
// PRESCRIPTIONS — Frontend JS
// ==========================

// Load on page start
document.addEventListener("DOMContentLoaded", loadPrescriptionsFromDB);

// ELEMENTS
const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");
const tableBody = document.getElementById("tableBody");
const selectAll = document.getElementById("selectAll");

// -------------------------------
// LOAD FROM BACKEND
// -------------------------------
async function loadPrescriptionsFromDB() {
    try {
        const res = await fetch("/prescriptions/data");
        const items = await res.json();

        tableBody.innerHTML = "";
        items.forEach(addRowToTable);
    } catch (err) {
        console.error("Error loading prescriptions:", err);
    }
}

// -------------------------------
// ADD NEW — SAVE
// -------------------------------
document.getElementById("saveReportBtn").addEventListener("click", async () => {

    const formData = new FormData();
    formData.append("name", document.getElementById("r_name").value);
    formData.append("type", document.getElementById("r_type").value);
    formData.append("specialty", document.getElementById("r_category").value);
    formData.append("date", document.getElementById("r_date").value);
    formData.append("doctor", document.getElementById("r_doctor").value);
    formData.append("file", document.getElementById("fileUpload").files[0]);

    const res = await fetch("/prescriptions/add", {
        method: "POST",
        body: formData
    });

    if (res.ok) {
        alert("Prescription saved!");
        closeAddReportModal();
        loadPrescriptionsFromDB();
    } else {
        alert("Error saving prescription");
    }
});

// -------------------------------
// ADD ROW TO TABLE
// -------------------------------
function addRowToTable(item) {
    const row = document.createElement("tr");
    row.dataset.id = item._id;

    row.innerHTML = `
        <td><input type="checkbox" class="row-checkbox"></td>
        <td>${item.name}</td>
        <td>${item.type}</td>
        <td>${item.specialty}</td>
        <td>${item.date}</td>
        <td>${item.doctor}</td>
        <td><span class="file-tag">${item.type}</span></td>
        <td><button class="viewBtn">View</button></td>
        <td><button class="deleteBtn">Delete</button></td>
    `;

    tableBody.appendChild(row);
}

// -------------------------------
// TABLE BUTTON ACTIONS
// -------------------------------
tableBody.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    const id = row.dataset.id;

    // VIEW
    if (e.target.classList.contains("viewBtn")) {
        const iframeUrl = `/uploads/prescriptions/${id}`;
        document.getElementById("modalContent").innerHTML =
            `<iframe src="${iframeUrl}" width="100%" height="520px" style="border:none;"></iframe>`;
        openViewModal();
    }

    // DELETE
    if (e.target.classList.contains("deleteBtn")) {
        if (confirm("Delete this prescription?")) {
            await fetch(`/prescriptions/delete/${id}`, { method: "DELETE" });
            row.remove();
        }
    }
});

// -------------------------------
// SEARCH + FILTER
// -------------------------------
searchBox.addEventListener("input", filterTable);
categoryFilter.addEventListener("change", filterTable);

function filterTable() {
    const search = searchBox.value.toLowerCase();
    const cat = categoryFilter.value;

    tableBody.querySelectorAll("tr").forEach(row => {
        const name = row.cells[1].innerText.toLowerCase();
        const specialty = row.cells[3].innerText;

        const matchSearch = name.includes(search);
        const matchCat = cat === "all" || specialty === cat;

        row.style.display = matchSearch && matchCat ? "" : "none";
    });
}

// -------------------------------
// SELECT ALL
// -------------------------------
selectAll.addEventListener("change", () => {
    const check = selectAll.checked;
    document.querySelectorAll(".row-checkbox").forEach(cb => cb.checked = check);
});

// -------------------------------
// ADD REPORT MODAL — OPEN/CLOSE
// -------------------------------
document.getElementById("addReportBtn").addEventListener("click", () => {
    document.getElementById("addReportModal").style.display = "flex";
});

document.getElementById("closeAddReport").addEventListener("click", closeAddReportModal);

function closeAddReportModal() {
    document.getElementById("addReportModal").style.display = "none";
}

// -------------------------------
// VIEW MODAL — OPEN/CLOSE
// -------------------------------
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
});

function openViewModal() {
    document.getElementById("modal").style.display = "flex";
}

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
// SHARE SELECTED (PLACEHOLDER)
// -------------------------------
document.getElementById("shareSelectedBtn").addEventListener("click", () => {
    const selected = [...document.querySelectorAll(".row-checkbox")]
        .filter(cb => cb.checked);

    if (selected.length === 0) {
        alert("Select at least one prescription to share.");
        return;
    }

    alert(`Sharing ${selected.length} prescription(s)... (coming soon!)`);
});
