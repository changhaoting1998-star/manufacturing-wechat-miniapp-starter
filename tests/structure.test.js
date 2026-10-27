const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("every declared page has four native files", () => {
  const config = JSON.parse(read("miniprogram/app.json"));
  for (const page of config.pages) {
    for (const extension of ["js", "json", "wxml", "wxss"]) assert.equal(fs.existsSync(path.join(root, "miniprogram", `${page}.${extension}`)), true, `${page}.${extension}`);
  }
});

test("project config is an example with no deployable AppID", () => {
  const config = JSON.parse(read("miniprogram/project.config.example.json"));
  assert.equal(config.appid, "replace-with-your-own-appid");
});

test("client configuration contains no production environment", () => {
  const config = read("miniprogram/config.example.js");
  assert.match(config, /replace-with-your-cloudbase-environment/);
});

test("sitemap blocks public indexing by default", () => {
  const sitemap = JSON.parse(read("miniprogram/sitemap.json"));
  assert.equal(sitemap.rules[0].action, "disallow");
});

test("repository does not ship deployable cloud entry", () => {
  assert.equal(fs.existsSync(path.join(root, "cloudfunctions/employeeGateway/index.js")), false);
  assert.equal(fs.existsSync(path.join(root, "cloudfunctions/employeeGateway/index.example.js")), true);
});

test("repository ignores private keys and databases", () => {
  const ignore = read(".gitignore");
  assert.match(ignore, /private\.\*\.key/);
  assert.match(ignore, /\*\.sqlite/);
  assert.match(ignore, /\*\.db/);
});

test("source contains no private address or real WeChat AppID shape", () => {
  const files = [];
  function walk(folder) {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory() && !["node_modules", ".git"].includes(entry.name)) walk(full);
      else if (entry.isFile()) files.push(full);
    }
  }
  walk(root);
  const body = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  assert.equal(/\bwx[a-f0-9]{16}\b/i.test(body), false);
  assert.equal(/(?<!\d)(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?!\d)/.test(body), false);
  assert.equal(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(body), false);
});

test("package is publicly licensed", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.license, "MIT");
  assert.equal(pkg.private, undefined);
  assert.match(read("LICENSE"), /MIT License/);
});
