---
name: CRM JSX edit safety
description: Prevent syntax regressions when changing nested lead-detail JSX.
---

For structural changes to the CRM lead-detail panel, reformat the affected JSX branch into readable multiline code instead of editing a very long condensed JSX line.

**Why:** A small missing JSX delimiter can break hot reload and is easy to overlook during a large one-line edit.

**How to apply:** Keep changes scoped to the reformatted branch, then run the CRM typecheck and build before packaging a project ZIP.
