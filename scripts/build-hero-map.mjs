import fs from "node:fs";
import path from "node:path";

const firms = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "firms.json"), "utf8"));
const W = 1000;
const H = 620;
const RAD = Math.PI / 180;

const phi1 = 29.5 * RAD;
const phi2 = 45.5 * RAD;
const phi0 = 37.5 * RAD;
const lam0 = -96 * RAD;
const n = 0.5 * (Math.sin(phi1) + Math.sin(phi2));
const C = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
const rho0 = Math.sqrt(C - 2 * n * Math.sin(phi0)) / n;

function project(lat, lon) {
  const rho = Math.sqrt(C - 2 * n * Math.sin(lat * RAD)) / n;
  const theta = n * ((lon * RAD) - lam0);
  const x = rho * Math.sin(theta);
  // SVG y grows downward; Albers y grows northward, so flip it here
  const y = rho * Math.cos(theta) - rho0;
  return [x, y];
}

const pts = [];
for (const f of firms) {
  if (
    !["AK", "HI", "PR", "VI", "GU"].includes(f.state) &&
    f.lat && f.lon &&
    f.lat > 24 && f.lat < 50 && f.lon > -126 && f.lon < -66
  ) {
    const [x, y] = project(f.lat, f.lon);
    pts.push([x, y]);
  }
}

const xs = pts.map((p) => p[0]);
const ys = pts.map((p) => p[1]);
const minX = Math.min(...xs), maxX = Math.max(...xs);
const minY = Math.min(...ys), maxY = Math.max(...ys);
const pad = 24;
const scale = Math.min((W - pad * 2) / (maxX - minX), (H - pad * 2) / (maxY - minY));
const ox = (W - (maxX - minX) * scale) / 2;
const oy = (H - (maxY - minY) * scale) / 2;

const cell = 3;
const bins = new Map();
for (const [x, y] of pts) {
  const px = Math.round((ox + (x - minX) * scale) / cell) * cell;
  const py = Math.round((oy + (y - minY) * scale) / cell) * cell;
  const key = `${px},${py}`;
  bins.set(key, (bins.get(key) || 0) + 1);
}

let max = 1;
for (const v of bins.values()) if (v > max) max = v;

const groups = [[], [], [], []];
for (const [key, count] of bins) {
  const [x, y] = key.split(",").map(Number);
  const t = Math.min(1, Math.log1p(count) / Math.log1p(max));
  const b = Math.min(3, Math.floor(t * 4));
  groups[b].push(`M${x} ${y}h3v3h-3z`);
}
const opacities = [0.3, 0.48, 0.68, 0.9];
const paths = groups
  .map((g, i) => (g.length ? `<path fill="#0f3d3e" fill-opacity="${opacities[i]}" d="${g.join("")}"/>` : ""))
  .join("");

let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
for (const key of bins.keys()) {
  const [x, y] = key.split(",").map(Number);
  if (x < bx0) bx0 = x;
  if (y < by0) by0 = y;
  if (x > bx1) bx1 = x;
  if (y > by1) by1 = y;
}
const pad2 = 10;
const vx = bx0 - pad2, vy = by0 - pad2, vw = bx1 - bx0 + pad2 * 2, vh = by1 - by0 + pad2 * 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw}" height="${vh}" role="img" aria-label="Map of accounts payable companies across the United States">
<title>Accounts payable provider density across the United States</title>
<g>${paths}</g>
</svg>`;

fs.mkdirSync(path.join(process.cwd(), "public"), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), "public", "us-firms-map.svg"), svg);
console.log("NYC", project(40.71,-74.0), "LA", project(34.05,-118.24), "SEA", project(47.6,-122.33), "MIA", project(25.76,-80.19));
console.log(`points=${pts.length} bins=${bins.size} max=${max} bytes=${svg.length}`);
