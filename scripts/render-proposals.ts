#!/usr/bin/env tsx
/**
 * Script to render proposals into Mintlify docs format.
 *
 * Usage: npx tsx scripts/render-proposals.ts [--check]
 *   --check: Verify generated files are up to date (exit 1 if not)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const PROPOSALS_DIR = path.join(__dirname, '..', 'proposals');
const DOCS_PROPOSALS_DIR = path.join(__dirname, '..', 'docs', 'proposals');
const DOCS_JSON_PATH = path.join(__dirname, '..', 'docs', 'docs.json');

interface ProposalMetadata {
  number: string;
  title: string;
  status: string;
  type: string;
  created: string;
  authors: string;
  sponsor: string;
  prNumber: string;
  slug: string;
  filename: string;
}

function parseProposalMetadata(content: string, filename: string): ProposalMetadata | null {
  if (filename === 'TEMPLATE.md' || filename === 'README.md' || filename.startsWith('0000-')) {
    return null;
  }

  const filenameMatch = filename.match(/^(\d+)-(.+)\.md$/);
  if (!filenameMatch) {
    console.warn(`Warning: Skipping ${filename} - doesn't match proposal naming convention`);
    return null;
  }

  const [, number, slug] = filenameMatch;

  const titleMatch = content.match(/^#\s+[A-Z.]+\s*(?:Enhancement\s*)?(?:Proposal|PROPOSAL)?:\s*(.+)$/m) ||
    content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

  const statusMatch = content.match(/^\s*-\s*\*\*Status\*\*:\s*(.+)$/m);
  const typeMatch = content.match(/^\s*-\s*\*\*Type\*\*:\s*(.+)$/m);
  const createdMatch = content.match(/^\s*-\s*\*\*Date\*\*:\s*(.+)$/m) || content.match(/^\s*-\s*\*\*Created\*\*:\s*(.+)$/m);
  const authorsMatch = content.match(/^\s*-\s*\*\*Author\*\*:\s*(.+)$/m) || content.match(/^\s*-\s*\*\*Author\(s\)\*\*:\s*(.+)$/m);
  const sponsorMatch = content.match(/^\s*-\s*\*\*Sponsor\*\*:\s*(.+)$/m);
  const prMatch = content.match(/^\s*-\s*\*\*PR\*\*:.*?(?:#|\/pull\/)(\d+)/m);

  return {
    number,
    title,
    status: statusMatch ? statusMatch[1].trim() : 'Draft',
    type: typeMatch ? typeMatch[1].trim() : 'Standards Track',
    created: createdMatch ? createdMatch[1].trim() : 'Unknown',
    authors: authorsMatch ? authorsMatch[1].trim() : 'Unknown',
    sponsor: sponsorMatch ? sponsorMatch[1].trim() : 'None',
    prNumber: prMatch ? prMatch[1] : number,
    slug,
    filename,
  };
}

function formatAuthors(authors: string): string {
  return authors.replace(/@([\w-]+)/g, '[@$1](https://github.com/$1)');
}

function getStatusBadgeColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'final') return 'green';
  if (s === 'accepted') return 'blue';
  if (s === 'in-review') return 'yellow';
  if (s === 'draft') return 'gray';
  if (s === 'rejected' || s === 'withdrawn') return 'red';
  if (s === 'dormant') return 'orange';
  if (s === 'superseded') return 'purple';
  return 'gray';
}

function generateProposalPage(proposal: ProposalMetadata, originalContent: string): string {
  const abstractIndex = originalContent.indexOf('## Summary') !== -1
    ? originalContent.indexOf('## Summary')
    : originalContent.indexOf('## Abstract');
  const body = abstractIndex !== -1 ? originalContent.slice(abstractIndex) : originalContent;

  return `---
title: "PROPOSAL-${proposal.number}: ${proposal.title}"
sidebarTitle: "PROPOSAL-${proposal.number}"
description: "${proposal.title}"
---

<div className="flex items-center gap-2 mb-4">
  <Badge color="${getStatusBadgeColor(proposal.status)}" shape="pill">${proposal.status}</Badge>
  <Badge color="gray" shape="pill">${proposal.type}</Badge>
</div>

| Field | Value |
|-------|-------|
| **Proposal** | ${proposal.number} |
| **Title** | ${proposal.title} |
| **Status** | ${proposal.status} |
| **Type** | ${proposal.type} |
| **Created** | ${proposal.created} |
| **Author** | ${formatAuthors(proposal.authors)} |
| **Sponsor** | ${formatAuthors(proposal.sponsor)} |
| **PR** | [#${proposal.prNumber}](https://github.com/cleanroom-agent/S.DEF/pull/${proposal.prNumber}) |

---

${body}
`;
}

function generateIndexPage(proposals: ProposalMetadata[]): string {
  const sorted = [...proposals].sort((a, b) => parseInt(b.number) - parseInt(a.number));

  const byStatus: Record<string, number> = {};
  for (const p of sorted) {
    const s = p.status.toLowerCase();
    byStatus[s] = (byStatus[s] || 0) + 1;
  }

  const tableRows = sorted.map((p) => {
    const badge = `<Badge color="${getStatusBadgeColor(p.status)}" shape="pill">${p.status}</Badge>`;
    return `| [PROPOSAL-${p.number}](/proposals/${p.number}-${p.slug}) | ${p.title} | ${badge} | ${p.type} | ${p.created} |`;
  }).join('\n');

  const statusSummary = Object.entries(byStatus)
    .map(([s, c]) => `- **${s.charAt(0).toUpperCase() + s.slice(1)}**: ${c}`)
    .join('\n');

  return `---
title: S.DEF Enhancement Proposals
sidebarTitle: Proposal Index
description: Index of all S.DEF Enhancement Proposals
---

S.DEF Enhancement Proposals are the primary mechanism for proposing changes to the Software Definition Exchange Format.

<Card title="Submit a Proposal" icon="file-plus" href="/community/proposal-guidelines">
  Learn how to submit your own Enhancement Proposal
</Card>

## Summary

${statusSummary || '- No proposals yet'}

## All Proposals

${sorted.length > 0
  ? `| Proposal | Title | Status | Type | Created |\n|-----|-------|--------|------|---------|\n${tableRows}`
  : 'No proposals submitted yet.'}

## Proposal Status Definitions

| Status | Definition |
| --- | --- |
| <Badge color="gray" shape="pill">Draft</Badge> | Proposal undergoing informal review |
| <Badge color="yellow" shape="pill">In-Review</Badge> | Proposal ready for formal review |
| <Badge color="blue" shape="pill">Accepted</Badge> | Proposal accepted, awaiting implementation |
| <Badge color="green" shape="pill">Final</Badge> | Proposal finalized with implementation complete |
| <Badge color="red" shape="pill">Rejected</Badge> | Proposal rejected |
| <Badge color="red" shape="pill">Withdrawn</Badge> | Proposal withdrawn by author |
| <Badge color="purple" shape="pill">Superseded</Badge> | Proposal replaced by a newer one |
| <Badge color="orange" shape="pill">Dormant</Badge> | Proposal without a sponsor |
`;
}

function readAllProposals(): { metadata: ProposalMetadata; content: string }[] {
  const files = fs.readdirSync(PROPOSALS_DIR).filter((f) => f.endsWith('.md'));
  const proposals: { metadata: ProposalMetadata; content: string }[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(PROPOSALS_DIR, file), 'utf-8');
    const metadata = parseProposalMetadata(content, file);
    if (metadata) {
      proposals.push({ metadata, content });
    }
  }

  return proposals;
}

function groupProposalsByStatus(
  proposals: ProposalMetadata[],
): Record<string, ProposalMetadata[]> {
  const groups: Record<string, ProposalMetadata[]> = {};
  const statusOrder = [
    'Final', 'Accepted', 'In-Review', 'Draft',
    'Withdrawn', 'Rejected', 'Superseded', 'Dormant',
  ];

  for (const p of proposals) {
    const status = p.status;
    if (!groups[status]) groups[status] = [];
    groups[status].push(p);
  }

  for (const status of Object.keys(groups)) {
    groups[status].sort((a, b) => parseInt(a.number) - parseInt(b.number));
  }

  const ordered: Record<string, ProposalMetadata[]> = {};
  for (const status of statusOrder) {
    if (groups[status]) ordered[status] = groups[status];
  }
  for (const status of Object.keys(groups)) {
    if (!ordered[status]) ordered[status] = groups[status];
  }

  return ordered;
}

function updateDocsJson(proposals: ProposalMetadata[]): string {
  const docsJson = JSON.parse(fs.readFileSync(DOCS_JSON_PATH, 'utf-8'));
  const grouped = groupProposalsByStatus(proposals);

  const proposalSubgroups: Array<string | { group: string; pages: string[] }> = [];

  for (const [status, statusProposals] of Object.entries(grouped)) {
    if (statusProposals.length === 0) continue;
    proposalSubgroups.push({
      group: status,
      pages: statusProposals.map((p) => `proposals/${p.number}-${p.slug}`),
    });
  }

  const proposalsTab = {
    tab: 'Proposals',
    pages: proposalSubgroups.length > 0
      ? ['proposals/index', ...proposalSubgroups]
      : ['proposals/index'],
  };

  // Remove existing Proposals tab and insert new one before Community tab
  docsJson.navigation.tabs = (docsJson.navigation.tabs || []).filter(
    (tab: { tab: string }) => tab.tab !== 'Proposals',
  );

  const communityIdx = docsJson.navigation.tabs.findIndex(
    (tab: { tab: string }) => tab.tab === 'Community',
  );
  if (communityIdx >= 0) {
    docsJson.navigation.tabs.splice(communityIdx, 0, proposalsTab);
  } else {
    docsJson.navigation.tabs.push(proposalsTab);
  }

  return JSON.stringify(docsJson, null, 2) + '\n';
}

async function main() {
  const checkMode = process.argv.includes('--check');

  console.log('Reading proposal files...');
  const proposals = readAllProposals();
  console.log(`Found ${proposals.length} proposal(s)`);

  if (!fs.existsSync(DOCS_PROPOSALS_DIR)) {
    fs.mkdirSync(DOCS_PROPOSALS_DIR, { recursive: true });
  }

  const expectedFiles: { path: string; content: string }[] = [];

  const indexContent = generateIndexPage(proposals.map((p) => p.metadata));
  expectedFiles.push({ path: path.join(DOCS_PROPOSALS_DIR, 'index.mdx'), content: indexContent });

  for (const { metadata, content } of proposals) {
    expectedFiles.push({
      path: path.join(DOCS_PROPOSALS_DIR, `${metadata.number}-${metadata.slug}.mdx`),
      content: generateProposalPage(metadata, content),
    });
  }

  const docsJsonContent = updateDocsJson(proposals.map((p) => p.metadata));
  expectedFiles.push({ path: DOCS_JSON_PATH, content: docsJsonContent });

  if (checkMode) {
    const tempDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'proposals-check-'));
    let hasChanges = false;

    try {
      const tempFiles: { original: string; temp: string }[] = [];
      for (const { path: fp, content } of expectedFiles) {
        const tempPath = path.join(tempDir, path.basename(fp));
        fs.writeFileSync(tempPath, content, 'utf-8');
        tempFiles.push({ original: fp, temp: tempPath });
      }

      const mdxTempFiles = tempFiles.filter(({ temp }) => temp.endsWith('.mdx')).map(({ temp }) => temp);
      if (mdxTempFiles.length > 0) {
        execFileSync(npx, ['prettier', '--write', ...mdxTempFiles], { stdio: 'pipe' });
      }

      for (const { original, temp } of tempFiles) {
        if (!fs.existsSync(original)) {
          console.error(`Missing file: ${original}`);
          hasChanges = true;
          continue;
        }
        const existing = fs.readFileSync(original, 'utf-8');
        const formatted = fs.readFileSync(temp, 'utf-8');
        if (existing !== formatted) {
          console.error(`File out of date: ${original}`);
          hasChanges = true;
        }
      }
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    if (hasChanges) {
      console.error('\nProposal documentation is out of date. Run: bun run generate:proposals');
      process.exit(1);
    }
    console.log('All proposal documentation is up to date.');
  } else {
    for (const { path: fp, content } of expectedFiles) {
      fs.writeFileSync(fp, content, 'utf-8');
      console.log(`Generated: ${path.relative(process.cwd(), fp)}`);
    }

    const filesToFormat = expectedFiles
      .filter(({ path: fp }) => fp.endsWith('.mdx'))
      .map(({ path: fp }) => path.relative(process.cwd(), fp));
    if (filesToFormat.length > 0) {
      console.log('\nFormatting generated files with Prettier...');
      execFileSync(npx, ['prettier', '--write', ...filesToFormat], { stdio: 'inherit' });
    }

    console.log('\nProposal documentation generated successfully!');
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
