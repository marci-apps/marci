// Builds what getmarci.ai and a GitHub release serve, into dist/:
//
//   dist/site/.well-known/agent-skills/index.json      discovery index (v0.2.0)
//   dist/site/.well-known/agent-skills/marci.tar.gz    the skill, SKILL.md at the archive root
//   dist/site/.well-known/agent-skills/marci/…         the same files, one by one, for
//                                                       agents installing from a SKILL.md link
//   dist/site/.well-known/agent-skills/marci-skill.zip the skill folder (marci/…), for uploading
//                                                       to claude.ai or ChatGPT
//   dist/marci-site.tar.gz                             all of dist/site, the one release asset
//                                                       getmarci.ai unpacks
//
// Run: node scripts/build.mjs   (needs tar and zip on PATH)
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { ROOT, SKILL_FILES, WELL_KNOWN, readSkill } from "./skill-files.mjs";

const { front } = readSkill();
const dist = join(ROOT, "dist");
const site = join(dist, "site");
const wellKnown = join(site, WELL_KNOWN);
const pack = join(dist, "pack", front.name);

rmSync(dist, { recursive: true, force: true });
for (const file of SKILL_FILES) {
  for (const target of [join(pack, file), join(wellKnown, front.name, file)]) {
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(ROOT, file), target);
  }
}

// The discovery archive has SKILL.md at its root; the upload zip has the folder.
const archive = join(wellKnown, `${front.name}.tar.gz`);
execFileSync("tar", ["-czf", archive, "-C", pack, ...SKILL_FILES], {
  env: { ...process.env, COPYFILE_DISABLE: "1" },
});
execFileSync("zip", ["-qrX", join(wellKnown, "marci-skill.zip"), front.name], { cwd: join(dist, "pack") });

const digest = `sha256:${createHash("sha256").update(readFileSync(archive)).digest("hex")}`;
const index = {
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills: [
    {
      name: front.name,
      type: "archive",
      description: front.description,
      url: `/${WELL_KNOWN}/${front.name}.tar.gz`,
      digest,
    },
  ],
};
writeFileSync(join(wellKnown, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
rmSync(join(dist, "pack"), { recursive: true, force: true });
execFileSync("tar", ["-czf", join(dist, "marci-site.tar.gz"), "-C", site, "."], {
  env: { ...process.env, COPYFILE_DISABLE: "1" },
});
console.log(`✓ built marci ${front.metadata.version} into dist/site (${digest.slice(0, 19)}…)`);
