// What the Marci skill is made of, shared by the check and the build.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Files that make up the installed skill. Everything else in the repo (README,
 * plugin manifests, CI, scripts) is packaging and never ships inside an archive. */
export const SKILL_FILES = [
  "SKILL.md",
  "references/ideas.md",
  "agents/openai.yaml",
  "LICENSE",
];

/** Where getmarci.ai serves the skill (Agent Skills discovery, v0.2.0). */
export const SITE_ORIGIN = "https://getmarci.ai";
export const WELL_KNOWN = ".well-known/agent-skills";

/** The frontmatter this repo writes: flat `key: value` pairs and one level of
 * nested map (`metadata:`). Not a general YAML parser. */
export function readSkill() {
  const text = readFileSync(join(ROOT, "SKILL.md"), "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("SKILL.md must start with a --- frontmatter block");
  const front = {};
  let nested = null;
  for (const line of match[1].split("\n")) {
    if (!line.trim()) continue;
    const indented = /^\s+/.test(line);
    const pair = line.trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) throw new Error(`Unreadable frontmatter line: ${line}`);
    const [, key, raw] = pair;
    const value = raw.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    if (indented) {
      if (!nested) throw new Error(`Indented line outside a map: ${line}`);
      front[nested][key] = value;
    } else if (value === "") {
      nested = key;
      front[key] = {};
    } else {
      nested = null;
      front[key] = value;
    }
  }
  return { front, body: match[2], text };
}
