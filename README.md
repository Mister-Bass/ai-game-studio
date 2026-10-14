# AI Game Studio

A reusable HTML5 educational browser game built with Vite, JavaScript, and Phaser. The sample **Number Quest** teaches beginner addition. Move a robot to the correct answer star and solve three puzzles. Correct answers earn 100 stars; three mistakes end the mission. Title, win, loss, restart, keyboard, touch controls, and responsive layout are included.

## Request games in plain English

You never need to write or edit code. Open this repository in your coding assistant and describe what you want. For example:

> Make a dinosaur game for second graders to practice subtraction up to 20. Use arrow keys, give gentle hints after mistakes, and finish after five correct answers. Keep the title screen, scoring, restart button, and mobile controls. Build it, run browser tests, and open a pull request for my approval. Do not deploy it until I approve.

> Change Number Quest into a forest vocabulary game for ages 8–10. Players collect the word matching a definition. Include ten animal words. Keep production updates in pull requests.

Include the age or grade, learning goal, theme, controls, scoring rules, and winning conditions if you know them. Otherwise ask the assistant to propose defaults. You can also say “Make it easier,” “Add a space theme,” or “Fix this bug” and explain what happened.

The assistant should implement your request, update tests, run checks, and provide a PR with a summary and preview. Review and approve when satisfied. Passing CI is not permission to merge or publish. AGENTS.md records this approval requirement for future coding sessions.

## Play

- Arrow keys or WASD: move one grid space.
- Space: collect the star under the robot.
- Enter: start from the title screen.
- R or Restart mission: reset score, lives, question, and robot position.
- On-screen buttons support touch.

There is no time limit. Wrong answers show an explanation and cost a life. The SVGs in public/assets are original placeholder artwork included for reuse and replacement. No external assets, accounts, or analytics are required to play.

## Template structure and development

src/content.js holds lesson questions, answers, lives, and points. src/main.js provides the Phaser scene and game state. index.html and src/style.css provide native buttons, live feedback, overlays, and the responsive shell. tests/game.spec.js exercises real input against the production build; DOM telemetry is read-only, with no test-only game mutation shortcuts.

For the assistant or developer, Node 24 is recommended:

```sh
npm ci
npm run dev
npm run build
npx playwright install --with-deps chromium firefox webkit
npm test
npm run package
```

The build output is dist. Playwright runs against Vite's production preview server. Tests cover loading, assets, movement, boundaries, scoring, win/loss, restart, touch buttons, and a narrow viewport across Chromium, Firefox, and WebKit. The canvas is visual; native buttons and live feedback improve accessibility, but this is not a fully nonvisual game.

## Pull requests, checks, and ZIP downloads

GitHub Actions runs **Build and browser tests** on every PR, main update, merge queue, and manual run. It builds, runs the browser suite, and produces a ZIP only after passing tests. Download **ai-game-studio-package** in the workflow run's Artifacts section. It contains ai-game-studio.zip, with playable/ (built website) and source/ (reusable template). GitHub may wrap this in an outer ZIP. Game artifacts expire after 30 days; browser reports after 14 days.

The main branch is protected: pull requests, the **Build and browser tests** GitHub Actions check, and up-to-date branches are required. Administrators cannot bypass the rule; force pushes and deletion are blocked. Workflow YAML alone cannot enforce these rules; the repository settings were configured separately.

PRs created through your connected GitHub identity are authored by you, so GitHub cannot accept your review of your own PR. Your manual decision to merge a passing PR is the approval gate. A separate approving review is not required; if you add another reviewer later, ask the assistant to require one review and dismiss stale approvals. No workflow automatically merges or deploys. The assistant must still wait for your explicit approval before merging.

## Cloudflare Pages deployment

Ask the assistant: “Connect this repository to Cloudflare Pages. Use main for production and keep production changes in pull requests for my approval.” No code editing is needed; account authorization or an initial dashboard connection may be required.

Use Git integration and these settings:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Production branch | main |
| Root directory | repository root |
| Build command | npm run build |
| Build output directory | dist |
| NODE_VERSION | 24 |

Enable preview deployments for PR branches if desired. Once connected, Cloudflare deploys main after an approved merge. Keep branch protections enabled to preserve the approval gate. This template prepares the static output; it does not create or deploy a Cloudflare project. public/_headers is copied into dist. Serve the ZIP's playable/ directory over HTTP; double-clicking index.html is unsupported because ES modules require HTTP.

References: [Cloudflare build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches), [Phaser scaling](https://docs.phaser.io/phaser/concepts/scale-manager).
