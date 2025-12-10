import { db, collection, getDocs } from "./firebase-config.js";
import { euclideanDistance } from "./utils.js";

const scanBtn = document.getElementById("scanBtn");
const resultEl = document.getElementById("result");

scanBtn.addEventListener("click", async () => {

    let descriptor = window.currentDescriptor;

    if (!descriptor) {
        resultEl.innerHTML = "No face detected!";
        resultEl.style.color = "red";
        return;
    }

    resultEl.innerHTML = "Scanning...";
    resultEl.style.color = "blue";

    // Load all face records
    const snapshot = await getDocs(collection(db, "faces"));

    if (snapshot.empty) {
        resultEl.innerHTML = "No registered faces in database!";
        resultEl.style.color = "red";
        return;
    }

    let bestMatch = null;
    let bestDistance = 999;

    snapshot.forEach(doc => {
        const data = doc.data();

        const dist = euclideanDistance(data.embeddings, descriptor);

        if (dist < bestDistance) {
            bestDistance = dist;
            bestMatch = data;
        }
    });

    // Matching threshold
    if (bestDistance < 0.60) {
        resultEl.innerHTML = `
            <strong>Match Found!</strong><br><br>
            Name: ${bestMatch.name}<br>
            Age: ${bestMatch.age}<br>
            Location: ${bestMatch.location}<br>
            Distance Score: ${bestDistance.toFixed(4)}
        `;
        resultEl.style.color = "green";
    } else {
        resultEl.innerHTML = "No Match Found!";
        resultEl.style.color = "red";
    }
});
