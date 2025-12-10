const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
let currentDescriptor = null;  // GLOBAL VARIABLE
let currentStream = null;      // for switching camera


// ============ SMART CAMERA LIST ============
async function loadCameraList() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter(d => d.kind === "videoinput");

    const camSelect = document.getElementById("cameraSelect");
    if (!camSelect) return;

    camSelect.innerHTML = ""; // clear old

    cams.forEach((cam, i) => {
        const opt = document.createElement("option");
        opt.value = cam.deviceId;
        opt.textContent = cam.label || `Camera ${i+1}`;
        camSelect.appendChild(opt);
    });

    // Auto-select first camera
    if (cams.length > 0) startCameraByDevice(cams[0].deviceId);
}


// ============ START CAMERA BY DEVICE ID ============
function startCameraByDevice(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
    }

    navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
    })
    .then(stream => {
        currentStream = stream;
        video.srcObject = stream;
    })
    .catch(err => console.error("Camera open error:", err));
}


// ============ OLD startCamera (for compatibility) ============
function startCamera() {
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
    })
    .then(stream => {
        currentStream = stream;
        video.srcObject = stream;
    })
    .catch(err => console.error("Camera error:", err));
}



// ============ LOAD MODELS ============
async function loadModels() {
    const basePath = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");

    await faceapi.nets.tinyFaceDetector.loadFromUri(basePath + "/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri(basePath + "/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri(basePath + "/models");

    console.log("Models loaded.");

    await loadCameraList();     // SMART CAMERA LIST RUN
}



// ============ DETECTION LOOP ============
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


// ============ SWITCH CAMERA HANDLER ============
const camSelect = document.getElementById("cameraSelect");
if (camSelect) {
    camSelect.addEventListener("change", function () {
        startCameraByDevice(this.value);
    });
}


// ============ INIT ============
loadModels();
window.currentDescriptor = currentDescriptor;
