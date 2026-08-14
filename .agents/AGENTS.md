# Workspace Rules & Instructions

- **Version Bumping**: Every time code changes are made, update/increment the version in `package.json`, `frontend-app/package.json`, and `backend/package.json` according to the following rules:
  - **Small Changes/Fixes/Edits**: Increment the patch version (third number, e.g., `1.0.0` -> `1.0.1`).
  - **New Features**: Increment the minor version (second number, e.g., `1.0.0` -> `1.1.0`).
  - **Migrations or Core Upgrades**: Increment the major version (first number, e.g., `1.0.0` -> `2.0.0`).
- **Full Website Audit Before Deployment**: Before triggering any production build or deployment, perform a complete audit across all website pages and components (Roadmap, Problem View, Cheat Sheet, Leaderboard, Mock Test, History, Admin Panel, Modals, Headers) to ensure Day & Night theme switching, routing, and UI elements render cleanly and consistently across both Light and Dark modes.
