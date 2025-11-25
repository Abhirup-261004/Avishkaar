console.log("Prescription JS Loaded");

// Show image preview per time slot
function handleFileSelect(event, slot) {
    const file = event.target.files[0];
    if (!file) return;

    const preview = document.getElementById(`${slot}Preview`);
    preview.src = URL.createObjectURL(file);

    document.getElementById(`${slot}PreviewSection`).classList.remove("hidden");
}

// Send to backend
async function processPrescription() {
    const morning = document.getElementById("morningInput").files[0];
    const afternoon = document.getElementById("afternoonInput").files[0];
    const night = document.getElementById("nightInput").files[0];

    if (!morning && !afternoon && !night) {
        return alert("Please upload at least one prescription image!");
    }

    document.getElementById("loadingSection").classList.remove("hidden");

    const formData = new FormData();
    if (morning) formData.append("morning", morning);
    if (afternoon) formData.append("afternoon", afternoon);
    if (night) formData.append("night", night);

    try {
        const res = await fetch("/api/prescription/parse", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        document.getElementById("loadingSection").classList.add("hidden");

        if (!data.success) {
            return alert("Parsing error: " + (data.error || data.msg || "Unknown error"));
        }

        document.getElementById("resultsSection").classList.remove("hidden");

        const resultsDiv = document.getElementById("results");
        const summary = data.data.summary;

        resultsDiv.innerHTML = `
            <h4>🩺 Health Summary</h4>
            <p>${summary}</p>
            <h4>📄 Raw Parsed Data</h4>
            <pre>${JSON.stringify(data.data, null, 2)}</pre>
        `;
    } catch (err) {
        console.log(err);
        alert("Upload failed");
    }
}

function resetApp() {
    location.reload();
}
