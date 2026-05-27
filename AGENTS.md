# Software Definition Exchange Format (S.DEF)

This repository contains the S.DEF specification, documentation, and schema.

## Documentation Structure

- `docs/` - Mintlify site (`bun run serve:docs`)
  - `docs/specification/` - S.DEF specification (versioned)
  - `docs/community/` - Governance, contributing, design principles, proposal guidelines
- `schema/` - Source of truth for the specification schema

### Documentation Guidelines

- When creating flowcharts and graphs to visualize aspects of the format, use mermaid diagrams where possible.
- When writing tables, ensure column headers and columns are aligned with whitespace.
- Before pushing or creating PRs, ensure that `bun run prep` is free of warnings and errors.

## Specification Versioning

Specifications use **date-based versioning** (YYYY-MM-DD), not semantic versioning:

- `schema/[YYYY-MM-DD]/` and `docs/specification/[YYYY-MM-DD]/` - released versions
- `schema/draft/` and `docs/specification/draft/` - in-progress work

## Schema Generation

TypeScript files are the **source of truth** for the format schema:

- Edit: `schema/[version]/schema.ts`
- Generate JSON + docs: `bun run generate:schema`
- This creates both `schema/[version]/schema.json` and the Schema Reference document in `docs/specification/[version]/schema.mdx`

Always regenerate after editing schema files.

## Schema Examples

JSON examples live in `schema/[version]/examples/[TypeName]/`:

- Directory name = schema type (e.g., `SoftwareDefinition/`)
- Files validate against their directory's type
- Referenced in `schema.ts` via `@example` JSDoc tags

## Proposal System

Major changes go through the proposal process:

- **Source**: `proposals/` directory — human-authored markdown files
- **Rendered**: `docs/proposals/` — auto-generated MDX from `bun run generate:proposals`
- **Template**: Copy `proposals/TEMPLATE.md`, name it `0000-{slug}.md`
- **Numbering**: Use `0000` as placeholder, backfill with PR number when opened

Proposals are indexed and rendered into the Mintlify docs site automatically.

## Useful Commands

```bash
# Dev servers
bun run serve:docs       # Local Mintlify docs server

# Generation (run after editing source files)
bun run generate         # Generate all (schema + proposals)
bun run generate:schema  # Generate JSON schemas + MDX from TypeScript
bun run generate:proposals  # Generate proposal documents

# Formatting
bun run format           # Format all (docs + schema)
bun run format:docs      # Format markdown/MDX files
bun run format:schema    # Format schema TypeScript files

# Checks
bun run check            # Run all checks
bun run check:schema     # Check schema (TS, JSON, examples, MDX)
bun run check:docs       # Check docs (format)
bun run check:proposals  # Check proposal documents

# Workflow
bun run prep             # Full prep before committing (check, generate, format)
```

## Issue Creation

Proposals are pull requests adding a file to `proposals/`, not issues.

## Commit Guidelines

- Keep commits focused and well-described
- When changing schema.ts, always include the generated schema.json and schema.mdx in the same commit
