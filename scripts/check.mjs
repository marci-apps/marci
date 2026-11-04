// Checks the skill against the Agent Skills spec (agentskills.io/specification) and
// keeps the repo's copies of the name, version and server URL in step.
// Run: node scripts/check.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, SKILL_FILES, SITE_ORIGIN, WELL_KNOWN, readSkill } from "./skill-files.mjs";

const MCP_URL = "https://mcp.getmarci.ai/mcp";
const problems = [];
const fail = (message) => problems.push(message);
const json = (path) => JSON.parse(readFileSync(join(ROOT, path), "utf8"));

const { front, body, text } = readSkill();

// Frontmatter, per the spec.
const allowed = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
for (const key of Object.keys(front)) if (!allowed.has(key)) fail(`Frontmatter field "${key}" is not in the Agent Skills spec`);
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(front.name ?? "") || front.name.length > 64) fail("name must be 1-64 lowercase letters, digits and single hyphens");
if (front.name !== "marci") fail(`name must be "marci", the install directory every agent uses (got "${front.name}")`);
if (!front.description || front.description.length > 1024) fail(`description must be 1-1024 characters (got ${front.description?.length ?? 0})`);
if (front.compatibility && front.compatibility.length > 500) fail(`compatibility must be at most 500 characters (got ${front.compatibility.length})`);
if (front.metadata && typeof front.metadata !== "object") fail("metadata must be a map of strings");
if (!front.metadata?.version) fail("metadata.version is the release version and must be set");
if (front.metadata?.["mcp-server"] !== MCP_URL) fail(`metadata.mcp-server must be ${MCP_URL}`);

// Body: the spec recommends under 500 lines; the server URL must be in it for
// agents that read only the body.
const lines = text.split("\n").length;
if (lines >= 500) fail(`SKILL.md has ${lines} lines; keep it under 500 and move detail to references/`);
if (!body.includes(MCP_URL)) fail("SKILL.md body must give the MCP server URL");

// Every relative link resolves, and every link to the hosted copy names a file the build publishes.
for (const [, target] of body.matchAll(/\]\(([^)]+)\)/g)) {
  if (/^https?:/.test(target)) continue;
  if (!existsSync(join(ROOT, target))) fail(`SKILL.md links to ${target}, which does not exist`);
}
for (const [url] of text.matchAll(new RegExp(`${SITE_ORIGIN.replace(/\./g, "\\.")}/${WELL_KNOWN.replace(/\./g, "\\.")}/marci/[^\\s)]+`, "g"))) {
  const path = url.slice(`${SITE_ORIGIN}/${WELL_KNOWN}/marci/`.length);
  if (!SKILL_FILES.includes(path)) fail(`${url} is not a file the build publishes`);
}
for (const path of SKILL_FILES) if (!existsSync(join(ROOT, path))) fail(`Skill file ${path} is missing`);

// Packaging copies agree with the skill.
const plugin = json(".claude-plugin/plugin.json");
const marketplace = json(".claude-plugin/marketplace.json");
const mcp = json(".mcp.json");
if (plugin.name !== front.name) fail("plugin.json name must match the skill name");
if (plugin.version !== front.metadata?.version) fail(`plugin.json version ${plugin.version} must match SKILL.md metadata.version ${front.metadata?.version}`);
if (plugin.license !== front.license) fail("plugin.json license must match SKILL.md license");
if (marketplace.plugins?.[0]?.name !== plugin.name) fail("marketplace.json must list the marci plugin");
if (mcp.mcpServers?.marci?.url !== MCP_URL) fail(`.mcp.json must point marci at ${MCP_URL}`);
const openai = readFileSync(join(ROOT, "agents/openai.yaml"), "utf8");
if (!openai.includes(`url: "${MCP_URL}"`)) fail(`agents/openai.yaml must declare ${MCP_URL}`);

// A release tag must match the version it ships.
const tag = process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : undefined;
if (tag && tag !== `v${front.metadata?.version}`) fail(`Tag ${tag} does not match SKILL.md metadata.version ${front.metadata?.version}`);

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join("\n"));
  process.exit(1);
}
console.log(`✓ marci ${front.metadata.version}: ${lines} lines, description ${front.description.length}/1024`);
