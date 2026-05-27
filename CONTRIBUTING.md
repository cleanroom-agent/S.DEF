# Contributing to S.DEF

Thank you for your interest in contributing to the Software Definition Exchange Format!

## Ways to Contribute

- **Report bugs** or request features via GitHub Issues
- **Submit proposals** for spec changes via the [proposal process](docs/community/proposal-guidelines.mdx)
- **Improve documentation** via pull requests
- **Review pull requests** from the community

## Proposal Process

For substantial specification changes, follow the Enhancement Proposal process:

1. **Discuss first** — Open a GitHub Discussion to socialize your idea
2. **Draft the proposal** — Copy `proposals/TEMPLATE.md`, name it `0000-{slug}.md`, and fill out all sections
3. **Open a PR** — Submit the proposal file as a pull request
4. **Rename with PR number** — After PR is created, rename `0000-` to the PR number
5. **Find a sponsor** — A maintainer must champion your proposal
6. **Run generation** — After renaming, run `bun run generate:proposals && bun run format:docs`

See [Proposal Guidelines](docs/community/proposal-guidelines.mdx) for full details.

## Development

```bash
# Setup
bun install

# Generate (run after editing source files)
bun run generate           # Generate all (schema + proposals)
bun run generate:schema    # Generate JSON schemas + MDX from TypeScript
bun run generate:proposals # Generate proposal documents

# Checks
bun run check              # Run all checks
bun run check:schema       # Check schema (TS, JSON, examples, MDX)
bun run check:docs         # Check docs formatting
bun run check:proposals    # Check proposals are up to date

# Dev server
bun run serve:docs         # Local Mintlify docs server

# Formatting
bun run format             # Format all files

# Full prep before committing
bun run prep               # Check → Generate → Verify → Format
```

### Schema Workflow

1. Edit `schema/[version]/schema.ts` (the source of truth)
2. Run `bun run generate:schema`
3. This auto-generates both `schema/[version]/schema.json` and `docs/specification/[version]/schema.mdx`
4. **Always commit all three files together**

### Before Submitting a PR

```bash
bun run prep
```

This runs the complete validation pipeline: TypeScript check → schema generation → docs check → proposals check → format.

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md).
