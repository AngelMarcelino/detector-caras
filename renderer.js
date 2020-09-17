const remote = require("electron").remote;
const ipc = require("electron").ipcRenderer,
  openButton = document.getElementById("openButton"),
  canvas = document.getElementById("c");
ctx = canvas.getContext("2d");

const fs = require("fs");

const faceapi = require("face-api.js");

ipc.on("selected-file", (event, filePath) => {
  console.log(event, filePath);
  image.setAttribute("src", "file://" + filePath);
});

let enabled = false;

let WebCamera = require("webcamjs");

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

var image = new Image();
image.onload = function () {
  ctx.drawImage(image, 0, 0);
};

console.log(faceapi);

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
  await faceapi.nets.ssdMobilenetv1.loadFromUri("./public/models");
})();

openButton.addEventListener("click", async function (event) {
  const video = document.querySelector("#camdemo video");
  console.log(video);
  const detections = await faceapi.detectAllFaces(video);
  console.log(detections);
  // ipc.send('select-file');
});
