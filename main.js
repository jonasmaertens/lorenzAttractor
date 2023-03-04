// eslint-disable-next-line import/no-unresolved
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Lorenz Attractor Params
const dt = 0.0005;
const p = 28;
const w = 10;
const beta = 8 / 3;
let x0 = 0.5;
let y0 = 0.5;
let z0 = 10;

// Client Params
const scaleX = 16;
const scaleY = 12;
const scatter = 5;
const lineOption = 0;
const lineOptions = ['round', 'miter', 'bevel'];

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
  $.translate(width / 2, height / 2);
  $.scale(scaleX, scaleY);
  $.lineWidth = 0.2;
  $.lineCap = lineOptions[lineOption];
  $.lineJoin = lineOptions[lineOption];
}

window.onresize = init;
init();

d3.select('canvas').on('mousemove', (evt) => {
  const m = d3.pointer(evt, canvas);
  x0 = (m[0] - width / 2) / scaleX;
  y0 = (m[1] - height / 2) / scaleY;
  z0 = 10 + (Math.random() - 0.5) * 10;
});

// consistent timing of animations when concurrent transitions are scheduled for fluidity
d3.timer(() => {
  // console.log("now")
  let x = x0 + (Math.random() - 0.5) * scatter;
  let y = y0 + (Math.random() - 0.5) * scatter;
  let z = z0 + (Math.random() - 0.5) * scatter;
  const n = (Math.random() * 5);
  const t1 = Math.random() * (30 / dt);

  const a = d3.timer((t0) => {
    for (let i = 0; i < n; i += 1) {
      $.beginPath();
      $.moveTo(x, y);
      $.strokeStyle = color(z);
      x += dt * w * (y - x);
      y += dt * (x * (p - z) - y);
      z += dt * (x * y - beta * z);
      $.lineTo(x, y);
      $.stroke();
    }
    if (t0 > t1) { a.stop(); }
  });

  $.save();
  $.setTransform(1, 0, 0, 1, 0, 0);
  $.globalCompositeOperation = 'source-atop';
  $.fillStyle = 'rgba(0,0,0,.05)';
  $.fillRect(0, 0, width, height);
  $.restore();
});
