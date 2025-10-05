# Repository Guidelines

## Project Structure & Module Organization
The VitePress app lives in `.vitepress/` with `config.ts`, theme overrides, and generated output in `.vitepress/dist`. Markdown content sits under `zh-CN/`; long-form notes belong in `zh-CN/笔记/`, the landing page in `zh-CN/index.md`, and navigation metadata in `metadata/index.ts`. Static assets (icons, fonts, redirects) stay in `public/`, while helper utilities are collected in `scripts/`.

## Build, Test, and Development Commands
Install dependencies via `pnpm install`. Run `pnpm run dev` (alias `pnpm run docs:dev`) to start VitePress locally on port 5173 and iterate on Markdown or theme changes. Use `pnpm run build` to emit the production site into `.vitepress/dist`, and `pnpm run serve` for a local preview. Lint TypeScript and Vue modules with `pnpm exec eslint . --ext ts,vue --max-warnings=0` before pushing.

## Coding Style & Naming Conventions
The repo follows `.editorconfig`: UTF-8, LF line endings, two-space indentation, trimmed trailing whitespace. ESLint extends `@antfu/eslint-config`; keep its import ordering, compositional helpers, and prefer `const` where possible. TypeScript runs in strict ESNext ESM mode, so avoid implicit `any`, document exported utilities, and use kebab-cased frontmatter slugs for Markdown filenames.

## Testing Guidelines
No automated suite exists yet; treat `pnpm run build` as the regression gate and confirm it passes before every PR. When extending `scripts/` or tweaking markdown-it plugins, add focused Vitest coverage or spell out manual verification in the pull request. Refresh table-of-contents entries and verify local search after restructuring content.

## Commit & Pull Request Guidelines
Commits in history are concise and imperative (for example, `update note(s).`, `Add .gitkeep ...`); mirror that tone and group related changes. Reference issues where relevant and avoid multi-topic commits. Pull requests should describe the goal, list touched areas, link any deploy previews, and attach screenshots or GIFs for visual tweaks in `zh-CN/`. Mention manual QA steps whenever metadata or build configuration changes.

## Content & Metadata Notes
Every new note needs frontmatter with `title`, `description`, and helpful `tags` so the local search plugin indexes it correctly. Update `metadata/index.ts` when adding authors, social links, or domains to keep banners and headers accurate. Store lightweight media in `public/` and cross-link related notes with the bidirectional syntax provided by the Markdown plugins.
