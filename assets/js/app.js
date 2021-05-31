//global variables
let flags = { running: false, pause: false, reset: false };
let cellSize, svgWidth, svgHeight, sideSize, cells, next;
let w = 0;
let h = 0;

const alive = 1; // a live pixel
const dead = 0; // a dead pixel

const svgDiv = document.querySelector("#image");
const status = document.getElementById("status");
const size = document.getElementById("cellSize");

//event handler for client window resize
const reportWindowSize = () => {
  h = parseInt(window.innerHeight - 200);
  w = parseInt(window.innerWidth - 200);
};

//handler for button clicks in client
const takeAction = (btn) => {
  const action = btn.target.id;
  if (action == "start" && !flags.running) {
    init();
    status.innerHTML = "Running";
    status.dataset.status = status.innerHTML;
    flags.running = true;
    animate();
  } else if (action == "pause" && flags.running) {
    flags.pause = !flags.pause;
    btn.target.innerHTML = btn.target.innerHTML == "Pause" ? "Resume" : "Pause";
    status.innerHTML = btn.target.innerHTML == "Pause" ? "Resumed" : "Paused";
    status.dataset.status = status.innerHTML;
  } else if (action == "reset") {
    status.innerHTML = "Reset";
    status.dataset.status = status.innerHTML;
    flags.reset = true;
    init();
  }
};

//creating button click handlers
document.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", takeAction));

const init = () => {
  reportWindowSize();
  cellSize = size.value;
  svgWidth = parseInt(w / cellSize);
  svgHeight = parseInt(h / cellSize);
  sideSize = cellSize - 1;
  cells = new Array(svgHeight * svgWidth);
  next = new Array(svgHeight * svgWidth);
  fillSVG();
};

//random fill array
const randomFill = () => {
  for (let i = 0; i < cells.length; i++) {
    if (Math.random() > 0.8) {
      cells[i] = alive; //20% chance of being alive
    } else {
      cells[i] = dead;
    }
  }
};

//fill SVG and present
function fillSVG() {
  randomFill();
  showlife();
}

//handle change of cell size in client
const sizeChange = () => {
  if (!flags.running) init();
};

// create SVG rectangle
const createSVGRect = (settings) => {
  let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  for (const key in settings) {
    rect.setAttribute(String(key), settings[key]);
  }
  return rect;
};

//create SVG line
const createSVGLine = (settings) => {
  let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  for (const key in settings) {
    line.setAttribute(String(key), settings[key]);
  }
  return line;
};

//get cell coordinates from index
const getCoords = (idx) => ({ x: (idx % svgWidth) * cellSize, y: parseInt(idx / svgWidth) * cellSize });

//creae live SVG rectangle representing cell
const makeLiveCell = (idx) => {
  const coords = getCoords(idx);
  return createSVGRect({ x: coords.x, y: coords.y, width: sideSize, height: sideSize, fill: "royalblue" });
};

//generate horizontal and vertical lines
const makeGrid = (svg) => {
  for (let index = 0; index < svgWidth + 1; index++) {
    const pos = index * cellSize;
    const line = createSVGLine({
      x1: pos,
      x2: pos,
      y1: 0,
      y2: "100%",
      stroke: "gray",
    });
    svg.appendChild(line);
  }
  for (let index = 0; index < svgHeight + 1; index++) {
    const pos = index * cellSize;
    const line = createSVGLine({
      x1: 0,
      x2: "100%",
      y1: pos,
      y2: pos,
      stroke: "gray",
    });
    svg.appendChild(line);
  }
};

//displays the cells
function showlife() {
  svgDiv.innerHTML = ""; //dropp current SVG
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);

  let rect = createSVGRect({ x: 0, y: 0, width: w, height: h, fill: "whitesmoke" });
  svg.appendChild(rect);

  for (const [i, cell] of cells.entries()) {
    if (cell == alive) svg.appendChild(makeLiveCell(i));
  }

  if (cellSize > 3) makeGrid(svg); //create grid only if cellSize is not min
  svgDiv.appendChild(svg);
}

//create SVG frame
const frame = () => {
  const w = svgWidth;
  for (const [i, cell] of cells.entries()) {
    const neighbours = [i - w - 1, i - w, i - w + 1, i - 1, i + 1, i + w - 1, i + w, i + w + 1].map(
      (permuation) => cells[permuation]
    );
    const populationSize = neighbours.reduce((acc, cell) => acc + cell, 0);
    next[i] = (populationSize === 2 && cell) || populationSize === 3 ? alive : dead;
  }
  for (let i = 0; i < next.length; i++) {
    cells[i] = next[i];
  }
};

//main animation loop with events handling
const animate = () => {
  if (flags.reset) {
    flags.reset = false;
    flags.running = false;
    svgDiv.innerHTML = "";
    return;
  }
  if (!flags.pause) {
    showlife();
    frame();
  }
  requestAnimationFrame(animate);
};

//register window resizie event to call init function
window.onresize = init;

//initialize app
init();
