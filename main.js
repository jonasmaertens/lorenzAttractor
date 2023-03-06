// eslint-disable-next-line import/no-unresolved
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Lorenz Attractor Params
const dt = 0.001;
const rho = 28;
const sigma = 10;
const beta = 8 / 3;
let x0 = 0.5;
let y0 = 0.5;
let z0 = 10;

// Client Params
let zoomX = 20;
let zoomY = zoomX * 0.7;
let scatter = 5;
let lineOption = 1;
const lineOptions = ['round', 'miter', 'bevel'];
let planeOption = 0;
let speed = 2;
let lifetime = 60;

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

function init() {
  width = document.documentElement.clientWidth;
  height = document.documentElement.clientHeight;
  canvas = d3
    .select('canvas')
    .attr('width', width)
    .attr('height', height)
    .node();
  $ = canvas.getContext('2d');
  $.globalCompositeOperation = lineOption ? 'lighter' : 'source-over';
  $.translate(width / 2, planeOption ? height / 2 : height / 1.1);
  $.scale(zoomX, zoomY);
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
d3.select('#planeSelect').on('change', (evt) => {
  planeOption = parseInt(evt.target.value, 10);
  init();
});
d3.select('#lineSelect').on('change', (evt) => {
  lineOption = parseInt(evt.target.value, 10);
  init();
});
const zoomSlider = d3.select('#zoomSlider');
const zoomLevelNode = d3.select('#zoomLevel').node();
zoomSlider.on('change', (evt) => {
  zoomX = parseInt(evt.target.value, 10);
  zoomY = zoomX * 0.7;
  zoomLevelNode.innerHTML = zoomX;
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
  speed = parseInt(evt.target.value, 10);
  speedLevelNode.value = speed;
  init();
});
const lifetimeSlider = d3.select('#lifetimeSlider');
const lifetimeLevelNode = d3.select('#lifetimeLevel').node();
lifetimeSlider.on('change', (evt) => {
  lifetime = parseInt(evt.target.value, 10);
  lifetimeLevelNode.value = lifetime;
  init();
});
init();

d3.select('canvas').on('mousemove', (evt) => {
  const m = d3.pointer(evt, canvas);
  x0 = (m[0] - width / 2) / zoomX;
  y0 = planeOption ? (m[1] - height / 2) / zoomY : 0.5;
  z0 = planeOption ? 10 : -(m[1] - height + 70) / zoomY;
  originXControl.node().value = Math.round(x0 * 10) / 10;
  originYControl.node().value = Math.round(y0 * 10) / 10;
  originZControl.node().value = Math.round(z0 * 10) / 10;
});

d3.timer(() => {
  let x = x0 + (Math.random() - 0.5) * scatter;
  let y = y0 + (Math.random() - 0.5) * scatter;
  let z = z0 + (Math.random() - 0.5) * scatter;
  const n = Math.random() * speed;
  const t1 = Math.random() * (lifetime / dt);

  const a = d3.timer((t0) => {
    for (let i = 0; i < n; i += 1) {
      $.beginPath();
      $.moveTo(x, planeOption ? y : -z);
      $.strokeStyle = color(z);
      x += dt * sigma * (y - x);
      y += dt * (x * (rho - z) - y);
      z += dt * (x * y - beta * z);
      $.lineTo(x, planeOption ? y : -z);
      $.stroke();
    }
    if (t0 > t1) {
      a.stop();
    }
  });

  //switch to default coordinate system and zoom to "reset" the canvas
  $.save();
  $.setTransform(1, 0, 0, 1, 0, 0);
  $.globalCompositeOperation = 'source-atop';
  $.fillStyle = 'rgba(0,0,0,.05)';
  $.fillRect(0, 0, width, height);
  $.restore();
});
