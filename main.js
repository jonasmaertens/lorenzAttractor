// eslint-disable-next-line import/no-unresolved
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Lorenz Attractor Params
const dt = 0.0005;
const rho = 28;
const sigma = 10;
const beta = 8 / 3;
let x0 = 0.5;
let y0 = 0.5;
let z0 = 10;
const zShift = 20;
const scaleFactor = 3;
const { sin, cos, sqrt, round, PI } = Math;

// Client Params
let zoom = 10;
let scatter = 5;
let lineOption = 1;
const lineOptions = ['round', 'miter', 'bevel'];
let speed = 3.5;
let lifetime = 60;
let phi = 0;
let theta = PI / 2;
let planeNorm = [cos(phi) * sin(theta), sin(phi) * sin(theta), cos(theta)];
let basisA;
let basisB;
// Color Range
const color = d3
  .scaleLinear()
  .domain([0, 20, 30, 45])
  .range(['yellow', 'orange', 'brown', 'purple'])
  .interpolate(d3.interpolateHcl);

let canvas;
let width;
let height;
let $;

function getCoordsOnPlane(p, n) {
  const tmp = sqrt(n[0] ** 2 + n[1] ** 2);
  if (tmp === 0) {
    basisA = [-1, 0, 0];
  } else {
    basisA = [n[1] / tmp, -n[0] / tmp, 0];
  }
  // cross product of normal and a
  basisB = [
    n[1] * basisA[2] - n[2] * basisA[1],
    n[2] * basisA[0] - n[0] * basisA[2],
    n[0] * basisA[1] - n[1] * basisA[0],
  ];
  const x = p[0] * basisA[0] + p[1] * basisA[1] + p[2] * basisA[2];
  const y = p[0] * basisB[0] + p[1] * basisB[1] + p[2] * basisB[2];
  return [x, y];
}

function init() {
  width = document.documentElement.clientWidth * scaleFactor;
  height = document.documentElement.clientHeight * scaleFactor;
  canvas = d3
    .select('canvas')
    .attr('width', width)
    .attr('height', height)
    .node();
  $ = canvas.getContext('2d');
  $.globalCompositeOperation = lineOption ? 'lighter' : 'source-over';
  $.translate(width / 2, height / 2);
  $.scale(zoom * scaleFactor, zoom * scaleFactor);
  $.lineWidth = 0.2;
  $.lineCap = lineOptions[lineOption];
  $.lineJoin = lineOptions[lineOption];
}

const originXControl = d3.select('#posX');
const originYControl = d3.select('#posY');
const originZControl = d3.select('#posZ');
originXControl.on('change', (evt) => {
  x0 = parseInt(evt.target.value, 10);
});
originYControl.on('change', (evt) => {
  y0 = parseInt(evt.target.value, 10);
});
originZControl.on('change', (evt) => {
  z0 = parseInt(evt.target.value, 10);
});
window.onresize = init;
d3.select('#lineSelect').on('change', (evt) => {
  lineOption = parseInt(evt.target.value, 10);
  init();
});
const zoomSlider = d3.select('#zoomSlider');
const zoomLevelNode = d3.select('#zoomLevel').node();
zoomSlider.on('change', (evt) => {
  zoom = parseInt(evt.target.value, 10);
  zoomLevelNode.innerHTML = zoom;
  init();
});
const scatterSlider = d3.select('#scatterSlider');
const scatterLevelNode = d3.select('#scatterLevel').node();
scatterSlider.on('change', (evt) => {
  scatter = parseInt(evt.target.value, 10);
  scatterLevelNode.innerHTML = scatter;
  init();
});
const speedSlider = d3.select('#speedSlider');
const speedLevelNode = d3.select('#speedLevel').node();
speedSlider.on('change', (evt) => {
  speed = parseFloat(evt.target.value, 10);
  speedLevelNode.value = speed;
  init();
});
const lifetimeSlider = d3.select('#lifetimeSlider');
const lifetimeLevelNode = d3.select('#lifetimeLevel').node();
lifetimeSlider.on('change', (evt) => {
  lifetime = parseFloat(evt.target.value, 10);
  lifetimeLevelNode.value = lifetime;
});
const thetaSlider = d3.select('#thetaSlider');
const thetaLevelNode = d3.select('#thetaLevel').node();
thetaSlider.on('change', (evt) => {
  theta = (parseInt(evt.target.value, 10) / 360) * 2 * PI;
  thetaLevelNode.innerHTML = evt.target.value;
  planeNorm = [cos(phi) * sin(theta), sin(phi) * sin(theta), cos(theta)];
});
const phiSlider = d3.select('#phiSlider');
const phiLevelNode = d3.select('#phiLevel').node();
phiSlider.on('change', (evt) => {
  phi = (parseInt(evt.target.value, 10) / 360) * 2 * PI;
  phiLevelNode.innerHTML = evt.target.value;
  planeNorm = [cos(phi) * sin(theta), sin(phi) * sin(theta), cos(theta)];
});
init();

d3.select('canvas').on('mousemove', (evt) => {
  const m = d3.pointer(evt, canvas);
  [x0, y0, z0] = basisA.map(
    (el, i) =>
      ((m[0] - width / 2 / scaleFactor) * el) / zoom +
      ((m[1] - height / 2 / scaleFactor) * basisB[i]) / zoom
  );
  z0 += zShift;
  originXControl.node().value = round(x0 * 10) / 10;
  originYControl.node().value = round(y0 * 10) / 10;
  originZControl.node().value = round(z0 * 10) / 10;
});

d3.timer(() => {
  let x = x0 + (Math.random() - 0.5) * scatter;
  let y = y0 + (Math.random() - 0.5) * scatter;
  let z = z0 + (Math.random() - 0.5) * scatter;
  const n = Math.random() * speed;
  const t1 = Math.random() * (lifetime / dt);
  let planeCoords = getCoordsOnPlane([x, y, z - zShift], planeNorm);
  const a = d3.timer((t0) => {
    for (let i = 0; i < n; i += 1) {
      $.beginPath();
      $.moveTo(planeCoords[0], planeCoords[1]);
      $.strokeStyle = color(z);
      x += dt * sigma * (y - x);
      y += dt * (x * (rho - z) - y);
      z += dt * (x * y - beta * z);
      planeCoords = getCoordsOnPlane([x, y, z - zShift], planeNorm);
      $.lineTo(planeCoords[0], planeCoords[1]);
      $.stroke();
    }
    if (t0 > t1) {
      a.stop();
    }
  });

  // switch to default coordinate system and zoom to "reset" the canvas
  $.save();
  $.setTransform(1, 0, 0, 1, 0, 0);
  $.globalCompositeOperation = 'source-atop';
  $.fillStyle = 'rgba(0,0,0,.05)';
  $.fillRect(0, 0, width, height);
  $.restore();
  // draw coordinate axes
  $.beginPath();
  $.moveTo(0, 0);
  let tmp = getCoordsOnPlane([20, 0, 0], planeNorm);
  $.lineTo(tmp[0], tmp[1]);
  $.strokeStyle = 'red';
  $.stroke();
  $.beginPath();
  $.moveTo(0, 0);
  tmp = getCoordsOnPlane([0, 20, 0], planeNorm);
  $.lineTo(tmp[0], tmp[1]);
  $.strokeStyle = 'green';
  $.stroke();
  $.beginPath();
  $.moveTo(0, 0);
  tmp = getCoordsOnPlane([0, 0, 20], planeNorm);
  $.lineTo(tmp[0], tmp[1]);
  $.strokeStyle = 'blue';
  $.stroke();
});
