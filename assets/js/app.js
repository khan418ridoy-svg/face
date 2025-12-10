const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
let currentDescriptor = null;  // GLOBAL VARIABLE

async function loadModels() {
   const basePath = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");

await faceapi.nets.tinyFaceDetector.loadFromUri(basePath + "/models");
await faceapi.nets.faceLandmark68Net.loadFromUri(basePath + "/models");
await faceapi.nets.faceRecognitionNet.loadFromUri(basePath + "/models");


    console.log("Models loaded.");
    startCamera();
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
    })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error("Camera error:", err));
}

video.addEventListener("play", () => {
    const ctx = canvas.getContext("2d");
    const liveText = document.getElementById("live");

    const detectLoop = async () => {

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const detection = await faceapi
            .detectSingleFace(video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 416,
                    scoreThreshold: 0.45
                })
            )
            .withFaceLandmarks()
            .withFaceDescriptor();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
            // STORE DESCRIPTOR
            currentDescriptor = Array.from(detection.descriptor);

            // DRAW BOX
            const box = detection.detection.box;
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            liveText.innerHTML = "OK";
            liveText.style.color = "green";

        } else {
            currentDescriptor = null;

            liveText.innerHTML = "No face detected!";
            liveText.style.color = "red";
        }

        window.currentDescriptor = currentDescriptor; // MAKE GLOBAL

        requestAnimationFrame(detectLoop);
    };

    detectLoop();
});

loadModels();
window.currentDescriptor = currentDescriptor;
