// === PRESCRIPTIONS ONLY – Unique Storage ===
localforage.config({
    name: 'MediVault_Prescriptions',
    storeName: 'prescriptions_files'
});

const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");
const tableBody = document.getElementById("tableBody");
const profileQrBtn = document.getElementById("profileQrBtn");
const shareSelectedBtn = document.getElementById("shareSelectedBtn");
const addReportBtn = document.getElementById("addReportBtn");
const selectAll = document.getElementById("selectAll");

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const addModal = document.getElementById("addReportModal");
const closeAddReport = document.getElementById("closeAddReport");
const saveReportBtn = document.getElementById("saveReportBtn");

const fileUpload = document.getElementById("fileUpload");
const fileInfo = document.getElementById("fileInfo");
const r_type = document.getElementById("r_type");

document.getElementById("r_date").value = new Date().toISOString().split("T")[0];

r_type.addEventListener("change", () => {
    const type = r_type.value;
    fileUpload.accept = type === "PDF" ? ".pdf" : "image/*";
    fileInfo.textContent = type === "PDF" ? "Only PDF allowed" : "Only images allowed";
    fileUpload.value = "";
});

document.addEventListener("DOMContentLoaded", loadSavedPrescriptions);

async function loadSavedPrescriptions() {
    const keys = await localforage.keys();
    const items = [];
    for (let key of keys) {
        if (key.startsWith("prescription_")) {
            const data = await localforage.getItem(key);
            items.push({ key, ...data });
        }
    }
    items.sort((a, b) => b.timestamp - a.timestamp);
    items.forEach(addRowToTable);
}

saveReportBtn.addEventListener("click", async () => {
    const name = document.getElementById("r_name").value.trim();
    const type = r_type.value;
    const specialty = document.getElementById("r_category").value.trim();
    const date = document.getElementById("r_date").value.trim();
    const doctor = document.getElementById("r_doctor").value.trim();
    const file = fileUpload.files[0];

    if (!name || !specialty || !date || !doctor || !file) {
        alert("Please fill all fields and upload a file.");
        return;
    }

    const allowed = type === "PDF" ? file.type === "application/pdf" : file.type.startsWith("image/");
    if (!allowed) {
        alert(`Please upload a valid ${type.toLowerCase()} file.`);
        return;
    }

    const id = Date.now();
    const fileKey = `file_${id}`;
    await localforage.setItem(fileKey, file);

    const data = { name, type, specialty, date, doctor, fileKey, timestamp: id };
    await localforage.setItem(`prescription_${id}`, data);

    addRowToTable({ key: `prescription_${id}`, ...data });
    addModal.style.display = "none";
    resetForm();
});

function resetForm() {
    document.getElementById("r_name").value = "";
    document.getElementById("r_category").value = "";
    document.getElementById("r_doctor").value = "";
    document.getElementById("r_date").value = new Date().toISOString().split("T")[0];
    fileUpload.value = "";
}

function addRowToTable(item) {
    const row = document.createElement("tr");
    row.dataset.reportId = item.timestamp;
    row.innerHTML = `
        <td><input type="checkbox" class="row-checkbox"></td>
        <td>${item.name}</td>
        <td>${item.type}</td>
        <td>${item.specialty}</td>
        <td>${item.date}</td>
        <td>${item.doctor}</td>
        <td><span class="file-tag">${item.type === "PDF" ? "PDF" : "IMG"}</span></td>
        <td><button class="viewBtn">View</button></td>
        <td><button class="deleteBtn">Delete</button></td>
    `;
    tableBody.prepend(row);
}

// Rest of the code (view, delete, QR, filter) — identical to reports.js
tableBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("viewBtn")) {
        const row = e.target.closest("tr");
        const id = row.dataset.reportId;
        const file = await localforage.getItem(`file_${id}`);
        if (!file) {
            modalContent.innerHTML = "<p>File missing!</p>";
        } else {
            const url = URL.createObjectURL(file);
            modalContent.innerHTML = file.type === "application/pdf"
                ? `<iframe src="${url}" width="100%" height="520px" style="border:none;"></iframe>`
                : `<img src="${url}" style="max-width:100%;max-height:520px;border-radius:8px;">`;
        }
        modal.style.display = "flex";
    }

    if (e.target.classList.contains("deleteBtn")) {
        if (confirm("Delete this prescription permanently?")) {
            const row = e.target.closest("tr");
            const id = row.dataset.reportId;
            await localforage.removeItem(`prescription_${id}`);
            await localforage.removeItem(`file_${id}`);
            row.remove();
        }
    }
});

closeModal.addEventListener("click", () => { modal.style.display = "none"; modalContent.innerHTML = ""; });

shareSelectedBtn.addEventListener("click", generateSelectiveQR);
profileQrBtn.addEventListener("click", generateFullQR);

async function generateSelectiveQR() {
    const checked = document.querySelectorAll(".row-checkbox:checked");
    if (checked.length === 0) return alert("Select at least one prescription.");

    const items = Array.from(checked).map(cb => {
        const row = cb.closest("tr");
        return { id: row.dataset.reportId, name: row.cells[1].innerText };
    });

    const expires = Math.floor((Date.now() + 24*60*60*1000)/1000);
    const token = btoa(`SELECTIVE_PRESC|IDS:${items.map(i=>i.id).join(",")}|EXP:${expires}`);
    const url = `http://localhost:4000/view-reports?token=${token}`;

    modalContent.innerHTML = `
        <h3>Share Selected Prescriptions</h3>
        <div style="background:#fff8e1;padding:12px;border-radius:8px;margin:10px 0;">
            ${items.map(i => "• " + i.name).join("<br>")}
        </div>
        <p><strong>Expires:</strong> ${new Date(expires*1000).toLocaleString()}</p>
        <div id="qrcode" style="width:240px;height:240px;margin:20px auto;"></div>
    `;
    modal.style.display = "flex";
    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), { text: url, width: 240, height: 240, colorDark: "#e65100" });
}

async function generateFullQR() {
    const rows = tableBody.querySelectorAll("tr");
    if (rows.length === 0) return alert("No prescriptions to share.");

    const ids = Array.from(rows).map(r => r.dataset.reportId).join(",");
    const expires = Math.floor((Date.now() + 24*60*60*1000)/1000);
    const token = btoa(`FULL_PRESC|IDS:${ids}|EXP:${expires}`);
    const url = `http://localhost:4000/view-reports?token=${token}`;

    modalContent.innerHTML = `
        <h3>Full Prescription Access QR</h3>
        <p>All ${rows.length} prescriptions • 24-hour access</p>
        <p><strong>Expires:</strong> ${new Date(expires*1000).toLocaleString()}</p>
        <div id="qrcode" style="width:240px;height:240px;margin:20px auto;"></div>
    `;
    modal.style.display = "flex";
    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), { text: url, width: 240, height: 240, colorDark: "#0d47a1" });
}

searchBox.addEventListener("input", filterTable);
categoryFilter.addEventListener("change", filterTable);
selectAll?.addEventListener("change", () => {
    document.querySelectorAll(".row-checkbox").forEach(cb => cb.checked = selectAll.checked);
});

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

addReportBtn.addEventListener("click", () => addModal.style.display = "flex");
closeAddReport.addEventListener("click", () => addModal.style.display = "none");