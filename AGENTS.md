# Game studio instructions

- The owner requests games in plain English. Implement, test, and document them without asking the owner to edit code.
- Keep production changes on feature branches and pull requests. Never push directly to main, merge a PR, or deploy production without the owner's approval.
- Keep reusable UI, controls, responsive sizing, and test coverage when replacing a sample game.
- Keep lesson content in src/content.js where practical. Use local assets with documented rights.
- Run npm run build, npm test, and npm run package before handing off changes. Report untested behavior.
- CI required check: Build and browser tests. Do not disable tests to bypass a failing check.
- Cloudflare Pages: npm run build; output dist; Node 24; production branch main. Preview branches are for review.
