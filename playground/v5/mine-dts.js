const fs = require("fs");
const { resolve } = require("path");

const Path = process.argv[2];

const dtsCache = { };
function loadDts(name, req) {
  if (req == null) { req = "index"; }
  const path = resolve(Path, "packages", name, "lib", `${ req }.d.ts`);
  if (dtsCache[path] == null) {
    dtsCache[path] = fs.readFileSync(path).toString();
  }
  return dtsCache[path];
}

function getExports(name) {
  const dts = loadDts(name);
  console.log(dts);

  const result = [ ];
  dts.replace(/export\s*\{([^}]*)\}(\s*from\s*"([^"]*)")?/igm, (all, outs, _, filename) => {
    console.log(outs, filename);
    if (filename && filename[0] === ".") {
      const dts = loadDts(name, filename.substring(2));
      console.log("GOT", dts);
    }
  });
}

console.log(getExports("ethers"));
