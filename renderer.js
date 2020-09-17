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
let enabled = false;

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

document.getElementById("start").addEventListener(
  "click",
  function () {
    if (!enabled) {
      enabled = true;
      WebCamera.attach("#camdemo");
      console.log("The camera has been started");
    } else {
      enabled = false;
      WebCamera.reset();
      console.log("The camera has been disabled");
    }
  },
  false
);

openButton.addEventListener("click", async function (event) {
  const video = document.querySelector("#camdemo video");
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!detections.length) {
    console.log("No faces were detected");
  }

  console.log(detections);
  // ipc.send('select-file');
});
