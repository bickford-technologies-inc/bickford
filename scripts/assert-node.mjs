import process from "process";

const major = Number(process.versions.node.split(".")[0]);

if (major !== 20) {
  console.error(
    `ERROR: Node ${process.versions.node} detected. Bickford requires Node 20.x`,
  );
  process.exit(1);
}
