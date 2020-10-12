const remote = require("electron").remote;
const fs = require("fs");
let WebCamera = require("webcamjs");
const faceapi = require("face-api.js");

const ipc = require("electron").ipcRenderer;

ipc.on("selected-file", (event, filePath) => {
  console.log(event, filePath);
  image.setAttribute("src", "file://" + filePath);
});

const openButton = document.getElementById("openButton");
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
var image = new Image();
image.onload = function () {
  ctx.drawImage(image, 0, 0);
};

faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement("canvas"),
  createImageElement: () => document.createElement("img"),
});

(async function () {
  console.log(process.resourcesPath);
  await faceapi.nets.ssdMobilenetv1.loadFromDisk("./public/models");
  await faceapi.nets.faceLandmark68Net.loadFromDisk("./public/models");
  await faceapi.nets.faceRecognitionNet.loadFromDisk("./public/models");
})();

let authorized = JSON.parse(fs.readFileSync("./authorized.json"));
authorized = authorized.map((user) => {
  return new faceapi.LabeledFaceDescriptors(
    user.name,
    user.descriptors.map((desc) => new Float32Array(desc))
  );
});

const faceMatcher = new faceapi.FaceMatcher(authorized);

function deny(error) {
  let element = document.getElementById("result");
  element.innerText = error;
  element.className = "alert alert-danger";
  console.log(error);
}
function grant(message) {
  let element = document.getElementById("result");
  element.innerText = message;
  element.className = "alert alert-success";
  console.log(message);
}

openButton.addEventListener("click", (event) => {
  WebCamera.attach("#camdemo");
  console.log("The camera has been started");
  setTimeout(async () => {
    const video = document.querySelector("#camdemo video");
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections.length) {
      deny("No se detectaron rostros");
      return;
    }
    let recognizedUsers = detections.map((det) =>
      faceMatcher.findBestMatch(det.descriptor)
    );
    let authorizedUserName = null;
    recognizedUsers.forEach((recognizerUser) => {
      if (recognizerUser.label != "unknown")
        authorizedUserName = recognizerUser.label;
    });
    if (authorizedUserName)
      grant(`Acceso concedido para ${authorizedUserName}`);
    else deny("Rostro no reconocido");

    WebCamera.reset();
    console.log("The camera has been disabled");
  }, 1000);
  // ipc.send('select-file');
});
