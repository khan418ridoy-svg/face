const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
let currentDescriptor = null;  // GLOBAL VARIABLE
let currentStream = null;      // store camera stream for switching


// ========== LOAD MODELS ==========
async function loadModels() {
    const basePath = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");

    await faceapi.nets.tinyFaceDetector.loadFromUri(basePath + "/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri(basePath + "/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri(basePath + "/models");

    console.log("Models loaded.");
    startCamera("user");   // default front camera
}



// ========== START CAMERA (NOW SUPPORTS SWITCH) ==========
function startCamera(mode = "user") {

    // Stop old camera stream
    if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
    }

    navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
    })
    .then(stream => {
        currentStream = stream;
        video.srcObject = stream;
    })
    .catch(err => console.error("Camera error:", err));
}



// ========== DETECT LOOP ==========
video.addEventListener("play", () => {
    const ctx = canvas.getContext("2d");
    const liveText = document.getElementById("live");

    const detectLoop = async () => {

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const detection = await faceapi
            .detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 416,
                    scoreThreshold: 0.45
                })
            )
            .withFaceLandmarks()
            .withFaceDescriptor();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
            currentDescriptor = Array.from(detection.descriptor);

            const box = detection.detection.box;
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            if (liveText) {
                liveText.innerHTML = "OK";
                liveText.style.color = "green";
            }

        } else {
            currentDescriptor = null;

            if (liveText) {
                liveText.innerHTML = "No face detected!";
                liveText.style.color = "red";
            }
        }

        window.currentDescriptor = currentDescriptor;

        requestAnimationFrame(detectLoop);
    };

    detectLoop();
});



// ========== CAMERA SWITCH HANDLER ==========
const camSelect = document.getElementById("cameraSelect");

if (camSelect) {
    camSelect.addEventListener("change", function () {
        startCamera(this.value);    // "user" (front) / "environment" (back)
    });
}



// ========== INIT ==========
loadModels();
window.currentDescriptor = currentDescriptor;
