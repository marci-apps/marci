# Marci for agents

[Marci](https://getmarci.ai) is your own software: apps built around your life and work
(to-dos, trackers, plans, budgets, shared spaces, games), on your phone and at
[app.getmarci.ai](https://app.getmarci.ai).

This repository is the **Marci skill**: one [Agent Skill](https://agentskills.io) that
teaches any agent how Marci works, plus the address of the **Marci MCP server** the agent
uses to reach your apps. Install it in Claude Code, Codex, Cursor, OpenClaw, Hermes,
Gemini CLI, OpenCode, Grok Build or any other agent that reads skills, and the agent can:

- keep what you tell it in the right app ("remind me Friday to cut the release")
- answer from your apps ("what's on my list today?")
- keep a project's to-dos, ship log or decisions beside the code
- open an app for you to use, including a game or puzzle while a long build runs
- find an app in Marci's catalog, or suggest a new one, when nothing you have fits

It works in two parts, and you need both:

| Part | What it is | Where it comes from |
|---|---|---|
| The skill | how Marci works and how to use it well | this repository |
| The connection | the Marci MCP server, signed in to your account | `https://mcp.getmarci.ai/mcp` |

## Hand this repository to your agent

Paste this into your agent:

```text
Install the Marci skill from https://github.com/marci-apps/marci and connect the
Marci MCP server, following the repository's README for this agent.
```

### Instructions for the agent doing the install

1. Work out which agent you are, then follow its row in [Install](#install). Prefer
   `npx skills add marci-apps/marci -a <your agent>` when you have a shell and Node;
   it knows where every agent keeps its skills.
2. Install for the whole user (`-g`) unless the person wants it only in this project.
3. Add the MCP server `https://mcp.getmarci.ai/mcp` (remote, streamable HTTP) with the
   command in the same row. Ask the person before changing their agent's configuration.
4. The server signs in with OAuth: a Marci page opens in the browser, the person signs
   in and chooses which apps you may use. Never ask for their password or a code.
5. Most agents load new skills and MCP tools only in a new session or after a reload.
   Tell the person, and confirm the install worked once `list_apps` is available.
6. If you cannot install skills or MCP servers yourself, give the person the steps from
   their agent's row.

## Install

`npx skills` (from [skills.sh](https://skills.sh)) installs the skill for any of 70+
agents. Each row then adds the connection.

| Agent | Skill | Connection |
|---|---|---|
| **Claude Code** | `/plugin marketplace add marci-apps/marci`, then `/plugin install marci@marci` (skill and connection together), or `npx skills add marci-apps/marci -a claude-code -g` | With the plugin: nothing more. Otherwise `claude mcp add --transport http -s user marci https://mcp.getmarci.ai/mcp`. Sign in from `/mcp` |
| **Codex** | `npx skills add marci-apps/marci -a codex -g` | `codex mcp add marci --url https://mcp.getmarci.ai/mcp`, then `codex mcp login marci`. The skill also declares the server in `agents/openai.yaml`, so Codex can offer to add it |
| **Cursor** | `npx skills add marci-apps/marci -a cursor -g` | Settings › MCP › add a server named `marci` with the URL `https://mcp.getmarci.ai/mcp` |
| **Gemini CLI** | `npx skills add marci-apps/marci -a gemini-cli -g` | `gemini mcp add --transport http marci https://mcp.getmarci.ai/mcp` |
| **OpenCode** | `npx skills add marci-apps/marci -a opencode -g` | `opencode mcp add` (remote, the URL above), then `opencode mcp auth marci` |
| **OpenClaw** | `clawhub install marci`, or `npx skills add marci-apps/marci -a openclaw -g` | Add `marci` under `mcp.servers` in `~/.openclaw/openclaw.json` with `url` `https://mcp.getmarci.ai/mcp`, `transport` `streamable-http` and OAuth on (`openclaw config schema` shows the exact keys for your version), then `openclaw mcp login marci` |
| **Hermes Agent** | `hermes skills install https://getmarci.ai/.well-known/agent-skills/marci/SKILL.md`, or `npx skills add marci-apps/marci -a hermes-agent -g`. `hermes skills search marci` finds it through skills.sh and ClawHub | `hermes mcp add marci --url https://mcp.getmarci.ai/mcp --auth oauth` |
| **Grok Build** | `npx skills add marci-apps/marci -a grok -g` | `grok mcp add marci https://mcp.getmarci.ai/mcp --transport http` |
| **GitHub Copilot, Windsurf, Goose, Cline, Zed, Kiro, …** | `npx skills add marci-apps/marci -a <agent> -g` ([agent names](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)) | Add a remote MCP server named `marci` with the URL `https://mcp.getmarci.ai/mcp` in the agent's MCP settings |
| **Claude (web and desktop)** | Download [marci-skill.zip](https://getmarci.ai/marci-skill.zip) and upload it under Customize › Skills | Settings › Connectors › Add custom connector › `https://mcp.getmarci.ai/mcp` |
| **ChatGPT** | Business and Enterprise plans: upload [marci-skill.zip](https://getmarci.ai/marci-skill.zip) as a skill | Add Marci as a connector with `https://mcp.getmarci.ai/mcp` |

### Agents that don't install outside skills

Some agents keep only their own built-in skills. For them, the Marci app gives you a
setup prompt to paste in instead: in Marci, open **Settings › Connected tools › Set up
an agent** and pick the agent.

- **Muse:** add Marci as a tool with the address in Marci, then paste the setup prompt.
- **Grok Bot:** ask it in chat to "add a custom server named marci at
  https://mcp.getmarci.ai/mcp" and approve the card, then paste the setup prompt.
  You can also ask it to read
  `https://getmarci.ai/.well-known/agent-skills/marci/SKILL.md`.

### Tools that can't sign in

For a tool that cannot do the OAuth sign-in, make a private link in Marci (**Settings ›
Connected tools › Make a private link**), choose its apps, and use that link as the
server address instead of `https://mcp.getmarci.ai/mcp`. The link is a secret: keep it in
the tool's MCP configuration only.

### Without `npx skills`

The skill is the files `SKILL.md`, `references/`, `agents/` and `LICENSE`. Copy them into
a folder named `marci` in your agent's skills directory, for example:

```sh
git clone --depth 1 https://github.com/marci-apps/marci /tmp/marci
mkdir -p ~/.claude/skills/marci
cp -R /tmp/marci/SKILL.md /tmp/marci/references /tmp/marci/agents /tmp/marci/LICENSE ~/.claude/skills/marci/
```

getmarci.ai also serves the skill for agents that discover skills by URL
([Agent Skills discovery](https://github.com/cloudflare/agent-skills-discovery-rfc)):

- index: `https://getmarci.ai/.well-known/agent-skills/index.json`
- archive: `https://getmarci.ai/.well-known/agent-skills/marci.tar.gz`
- single files: `https://getmarci.ai/.well-known/agent-skills/marci/SKILL.md` and
  `…/marci/references/ideas.md`

## What to try

Once the skill and the connection are in:

- "What's on my Marci lists today?"
- "Remind me Friday at 10 to cut the release."
- "Log what we shipped today in my Ship Log."
- "Keep this project's to-dos in Marci and close them as we commit."
- "The build takes ten minutes. Open a quick puzzle."
- "Find me a Marci app for tracking job applications."

The skill leaves the lead to you. An agent offers Marci on its own only when something
clearly fits what you are doing, at most once a session, and drops it if you say no.

## Opening an app

Hosts that draw MCP app views (ChatGPT and others) show the app in the conversation.
Everywhere else, `open_app` returns `host_url`: the same app on a page Marci hosts. The
agent opens it in its in-app browser or preview pane if it has one, or gives you the
link when you ask to see the app.

- The link opens **once**, within a few minutes.
- The browser that opens it stays signed in for about **12 hours**, reloads included.
- Opening the same link again, in another browser or tab, shows an expired page. Ask for
  the app again to get a fresh link.
- It is your private link. Don't share it; for something to share, ask for the app's
  public link.

## Privacy and permissions

- You choose what each agent may use when it signs in: read or write per app, and
  whether it may install templates, suggest apps, start shared spaces, send invitations,
  save documents or open apps. Change it any time in Marci under **Settings › Connected
  tools**, where every action an agent took is listed in plain sentences.
- The connection never reads your email, calendar, health, location, memories, saved
  documents or conversations. Private apps kept only on your phone are never reachable.
- Agents are told never to send passwords, API keys, authentication codes, government
  identifiers, protected health information or payment-card data to Marci.
- [Privacy policy](https://getmarci.ai/privacy) · [Terms](https://getmarci.ai/terms) ·
  [Support](https://getmarci.ai/support)

## What's in this repository

```text
SKILL.md                     the skill
references/ideas.md          where Marci helps, by kind of agent, with catalog keywords
agents/openai.yaml           Codex: display name and the MCP server the skill needs
LICENSE                      MIT-0
.claude-plugin/              Claude Code plugin and marketplace manifests, icon
.mcp.json                    the Marci MCP server, for the Claude Code plugin
scripts/check.mjs            checks the skill against the Agent Skills spec
scripts/build.mjs            builds the copies getmarci.ai and releases serve (dist/)
.github/workflows/           checks on every push; publishing on a release tag
```

## Releasing

skills.sh, the Claude Code plugin and `npx skills` read this repository directly, so
everything merged to `main` reaches them. A release publishes the copies that are not
read from the repository:

1. Raise `metadata.version` in `SKILL.md` and `version` in `.claude-plugin/plugin.json`
   (the check fails if they differ).
2. Merge to `main`, then push a matching tag: `git tag v1.0.1 && git push origin v1.0.1`.
3. The **Release** workflow checks and builds, then:
   - creates a GitHub release with `marci-skill.zip` and `marci.tar.gz`
   - publishes to ClawHub as `marci` (needs the `CLAWHUB_TOKEN` secret; the
     `CLAWHUB_OWNER` secret publishes under an organisation handle)
   - getmarci.ai picks up the release's files by itself, so the hosted copy follows
     each release

The ClawHub step is skipped while its secret is missing. The secrets are
listed in `.env` (kept out of git); load them with
`gh secret set -f .env --repo marci-apps/marci`.

Locally: `node scripts/check.mjs` and `node scripts/build.mjs` (needs `tar` and `zip`).

## License

[MIT-0](LICENSE). ClawHub publishes every skill under MIT-0, so the repository uses the
same licence everywhere.
