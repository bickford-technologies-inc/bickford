import fs from "fs";

const canon = JSON.parse(fs.readFileSync("CANON/canon.json", "utf8"));

const color = Object.values(canon.runtime).every(Boolean)
  ? "brightgreen"
  : "red";

const badge = `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="m">
    <rect width="140" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#m)">
    <rect width="80" height="20" fill="#555"/>
    <rect x="80" width="60" height="20" fill="${color === "brightgreen" ? "#4c1" : "#e05d44"}"/>
    <rect width="140" height="20" fill="url(#b)"/>
  </g>
  <g fill="#fff" text-anchor="middle"
     font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
     font-size="11">
    <text x="40" y="15">canon</text>
    <text x="110" y="15">${canon.meta.version}</text>
  </g>
</svg>
`;

fs.mkdirSync("badges", { recursive: true });
fs.writeFileSync("badges/canon.svg", badge.trim());
console.log("🏷 Canon badge generated");
