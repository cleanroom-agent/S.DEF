#!/usr/bin/env tsx
/**
 * Generate schema.mdx from schema.ts — extracts interfaces and their JSDoc
 * descriptions grouped by section, producing a comprehensive Schema Reference.
 *
 * Usage: tsx scripts/generate-schema-doc.ts [version]
 *   version: defaults to "draft", writes to schema/[version]/schema.mdx
 */

import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

const VERSION = process.argv[2] || "draft";
const SCHEMA_TS = path.join(__dirname, "..", "schema", VERSION, "schema.ts");
const OUTPUT_MDX = path.join(__dirname, "..", "schema", VERSION, "schema.mdx");

interface Section {
  title: string;
  interfaces: InterfaceInfo[];
}

interface InterfaceInfo {
  name: string;
  jsdoc: string;
  props: PropInfo[];
}

interface PropInfo {
  name: string;
  type: string;
  description: string;
  optional: boolean;
}

function readSource(): string {
  return fs.readFileSync(SCHEMA_TS, "utf-8");
}

function parseSource(source: string): Section[] {
  const sourceFile = ts.createSourceFile(
    "schema.ts",
    source,
    ts.ScriptTarget.ES2022,
    true,
  );

  // Collect all interface declarations with their positions
  const interfaces: { name: string; node: ts.InterfaceDeclaration }[] = [];

  function visit(node: ts.Node) {
    if (
      ts.isInterfaceDeclaration(node) &&
      node.name.text !== "" &&
      (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0
    ) {
      interfaces.push({ name: node.name.text, node });
    }
    ts.forEachChild(node, visit);
  }
  ts.forEachChild(sourceFile, visit);

  // Split source into sections by "// ======" markers
  // The pattern is: // ====== / Section Name / ======
  const lines = source.split("\n");
  const sectionMarkers: { line: number; title: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match lines like "// ============" or "// ========="
    if (/^\/\/\s*=+$/.test(line) && lines[i + 1]) {
      const nextLine = lines[i + 1].trim();
      // Next line should be "// Section Name"
      if (nextLine.startsWith("// ")) {
        const title = nextLine.replace(/^\/\/\s*/, "").trim();
        if (title && !title.includes("====") && !title.includes("*")) {
          sectionMarkers.push({ line: i, title });
        }
      }
    }
  }

  // Assign interfaces to sections based on line position
  // Get the start line of each interface (approximate via trivia)
  const ifaceLines = interfaces.map((iface) => {
    const pos = sourceFile.getLineAndCharacterOfPosition(iface.node.getStart(sourceFile));
    return { ...iface, line: pos.line };
  });

  const sections: Section[] = [];
  for (let i = 0; i < sectionMarkers.length; i++) {
    const marker = sectionMarkers[i];
    const nextMarkerLine =
      i + 1 < sectionMarkers.length
        ? sectionMarkers[i + 1].line
        : lines.length;

    const sectionInterfaces = ifaceLines
      .filter((f) => f.line >= marker.line && f.line < nextMarkerLine)
      .map((f) => extractInterfaceInfo(f.name, f.node, sourceFile));

    if (sectionInterfaces.length > 0) {
      sections.push({
        title: marker.title,
        interfaces: sectionInterfaces,
      });
    }
  }

  return sections;
}

function extractInterfaceInfo(
  name: string,
  node: ts.InterfaceDeclaration,
  sourceFile: ts.SourceFile,
): InterfaceInfo {
  // Extract JSDoc from leading comment ranges
  const sourceText = sourceFile.getFullText();
  const nodeStart = node.getFullStart();
  const nodeStartPos = sourceFile.getLineAndCharacterOfPosition(nodeStart);

  // Get the leading comments
  const commentRanges = ts.getLeadingCommentRanges(sourceText, nodeStart);
  let jsdoc = "";
  if (commentRanges) {
    for (const range of commentRanges) {
      if (range.kind === ts.SyntaxKind.MultiLineCommentTrivia) {
        const commentText = sourceText.substring(range.pos, range.end);
        if (commentText.startsWith("/**")) {
          // Clean up JSDoc
          jsdoc = commentText
            .replace(/^\/\*\*?\s*/, "")
            .replace(/\s*\*\/$/, "")
            .split("\n")
            .map((line) => line.replace(/^\s*\*\s?/, "").trim())
            .filter((l) => l && !l.startsWith("@example") && !l.startsWith("@see"))
            .join("\n");
        }
      }
    }
  }

  // Extract properties
  const props: PropInfo[] = [];
  for (const member of node.members) {
    if (ts.isPropertySignature(member)) {
      const propName = (member.name as ts.Identifier).text;
      const optional = !!member.questionToken;
      const typeNode = member.type;
      const typeStr = typeNode ? typeNode.getText(sourceFile) : "unknown";

      // Extract leading comment for this property
      const propStart = member.getFullStart();
      const propComments = ts.getLeadingCommentRanges(sourceText, propStart);
      let desc = "";
      if (propComments) {
        for (const r of propComments) {
          if (r.kind === ts.SyntaxKind.MultiLineCommentTrivia) {
            const ct = sourceText.substring(r.pos, r.end);
            if (ct.startsWith("/**")) {
              desc = ct
                .replace(/^\/\*\*?\s*/, "")
                .replace(/\s*\*\/$/, "")
                .split("\n")
                .map((l) => l.replace(/^\s*\*\s?/, "").trim())
                .filter(Boolean)
                .join(" ");
            }
          }
        }
      }

      props.push({
        name: propName,
        type: typeStr,
        description: desc,
        optional,
      });
    }
  }

  return { name, jsdoc, props };
}

function generateMDX(sections: Section[]): string {
  const lines: string[] = [];

  lines.push("# Schema Reference");
  lines.push("");
  lines.push(
    "This section documents the formal schema for S.DEF documents.",
  );
  lines.push("");
  lines.push(
    `The canonical schema is defined in TypeScript at [schema/${VERSION}/schema.ts](https://github.com/cleanroom-agent/S.DEF/blob/main/schema/${VERSION}/schema.ts)`,
  );
  lines.push(
    `and generated into JSON Schema at [schema/${VERSION}/schema.json](https://github.com/cleanroom-agent/S.DEF/blob/main/schema/${VERSION}/schema.json).`,
  );
  lines.push("");
  lines.push(`{/* @category SoftwareDefinition */}`);
  lines.push("");
  lines.push("## Type Index");
  lines.push("");

  // Build TOC
  for (const section of sections) {
    const anchor = section.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    lines.push(`- [${section.title}](#${anchor})`);
    for (const iface of section.interfaces) {
      const ifaceAnchor = iface.name.toLowerCase();
      lines.push(`  - [\`${iface.name}\`](#${ifaceAnchor})`);
    }
  }
  lines.push("");

  // Generate sections
  for (const section of sections) {
    lines.push(`## ${section.title}`);
    lines.push("");

    for (const iface of section.interfaces) {
      lines.push(`### \`${iface.name}\``);
      lines.push("");

      if (iface.jsdoc) {
        // Clean up JSDoc — remove leading * and /**, trim
        const cleaned = iface.jsdoc
          .replace(/^\/\*\*?\s*/, "")
          .replace(/\s*\*\/$/, "")
          .split("\n")
          .map((line) => line.replace(/^\s*\*\s?/, "").trim())
          .filter(Boolean)
          .join("\n");
        if (cleaned) {
          lines.push(cleaned);
          lines.push("");
        }
      }

      if (iface.props.length > 0) {
        lines.push("| Property | Type | Required | Description |");
        lines.push("| --- | --- | --- | --- |");
        for (const prop of iface.props) {
          const req = prop.optional ? "No" : "Yes";
          const desc = prop.description || "-";
          const escType = prop.type.replace(/\|/g, "\\|");
          lines.push(`| \`${prop.name}\` | \`${escType}\` | ${req} | ${desc} |`);
        }
        lines.push("");
      }
    }
  }

  return lines.join("\n") + "\n";
}

function main() {
  const source = readSource();
  const sections = parseSource(source);
  const mdx = generateMDX(sections);

  fs.writeFileSync(OUTPUT_MDX, mdx, "utf-8");
  console.log(`  ✓ Generated schema.mdx for ${VERSION}`);
  const typeCount = sections.reduce((sum, s) => sum + s.interfaces.length, 0);
  console.log(`    ${sections.length} sections, ${typeCount} types documented`);
}

main();
