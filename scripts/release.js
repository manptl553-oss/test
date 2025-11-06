import { execSync } from "child_process";
import fs from "fs";

function run(cmd) {
  console.log(`\n🛠️  Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function bumpVersion(type = "patch") {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  const [major, minor, patch] = pkg.version.split(".").map(Number);
  let newVersion;

  if (type === "major") newVersion = `${major + 1}.0.0`;
  else if (type === "minor") newVersion = `${major}.${minor + 1}.0`;
  else newVersion = `${major}.${minor}.${patch + 1}`;

  pkg.version = newVersion;
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  console.log(`📦 Version bumped to ${newVersion}`);
  return newVersion;
}

const type = process.argv[2] || "patch";
const version = bumpVersion(type);

run("npm run clean");
run("npm run build");

run("git add .");
run(`git commit -m "chore(release): v${version}" || true`);
run(`git tag v${version}`);
run("git push && git push --tags");

console.log("\n✅ Release complete!");
