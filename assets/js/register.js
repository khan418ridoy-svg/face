import { db, collection, addDoc, getDocs } from "./firebase-config.js";
import { euclideanDistance } from "./utils.js";

const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

saveBtn.addEventListener("click", async () => {

    let descriptor = window.currentDescriptor;

    if (!descriptor) {
        statusEl.innerHTML = "No face detected!";
        statusEl.style.color = "red";
        return;
    }

    const name = document.getElementById("nameInput").value.trim();
    const age = document.getElementById("ageInput").value.trim();
    const location = document.getElementById("locInput").value.trim();

    if (!name || !age || !location) {
        statusEl.innerHTML = "Fill all fields.";
        statusEl.style.color = "red";
        return;
    }

    statusEl.innerHTML = "Checking duplicate...";
    statusEl.style.color = "orange";

    // LOAD ALL REGISTERED FACES
    const snapshot = await getDocs(collection(db, "faces"));

    let duplicateFound = false;

    snapshot.forEach(doc => {
        const data = doc.data();

        const dist = euclideanDistance(data.embeddings, descriptor);

        if (dist < 0.55) {   // MATCH THRESHOLD
            duplicateFound = true;
        }
    });

    if (duplicateFound) {
        statusEl.innerHTML = "This face is already registered!";
        statusEl.style.color = "red";
        return;
    }

    // IF NOT DUPLICATE → SAVE
    try {
        await addDoc(collection(db, "faces"), {
            name,
            age,
            location,
            embeddings: descriptor,
            createdAt: Date.now()
        });

        statusEl.innerHTML = "Face registered successfully!";
        statusEl.style.color = "green";

    } catch (err) {
        console.error(err);
        statusEl.innerHTML = "ERROR saving!";
        statusEl.style.color = "red";
    }
});
