# PROPOSAL-0000: Reconstruction Policy (PTDL) — Avoid Source-Language Implementation Artifacts in Cross-Paradigm Reconstruction

> **Note**: This proposal introduces a new S.DEF layer for explicitly classifying S.DEF elements by their relationship to the source implementation language, enabling consumer agents to skip, replace, or translate implementation artifacts that should not survive a cross-language/paradigm reconstruction.

- **Status**: Draft
- **Type**: Standards Track
- **Created**: 2026-06-02
- **Author**: laplaceliu
- **Sponsor**: None
- **PR**: https://github.com/cleanroom-agent/S.DEF/pull/0000

## Summary

This proposal adds a new top-level `reconstruction_policy` block to `SoftwareDefinition`, an element-level `origin` field on the six core entity types, and four supporting types (`ParadigmMetadata`, `LibrarySubstitution`, `LibraryCandidate`, `TransformationHint`). Together they form the **Paradigm Translation & Decoupling Layer (PTDL)** — a mechanism that tells a consumer agent not just "what to build" but "which parts of the S.DEF are source-language implementation artifacts and should be omitted, replaced, or translated when rebuilding in a different language or paradigm."

The proposal is fully backward compatible: all new fields are optional, and existing S.DEF documents remain valid unchanged.

## Motivation

The current S.DEF describes "what software does and why" but is **silent** about the relationship between any given S.DEF element and the source implementation language. This is fine for same-language, same-paradigm refactoring, but breaks down for the most common reconstruction use case: **cross-language, cross-paradigm replication** (e.g. reproducing a C codebase in Rust, or an OCaml codebase in Java).

Concrete failure modes observed when reconstructing `redis 1.3.12` (C) into Rust without PTDL:

| S.DEF element derived from     | Naive 1:1 translation produces                  | What Rust idiomatic would be                 |
| ------------------------------ | ----------------------------------------------- | -------------------------------------------- |
| `zmalloc.c` (custom allocator) | `GlobalAlloc` with `used_memory` accounting     | Use `Box`/`Vec`; allocator is invisible      |
| `sds.c` (custom string)        | `Sds` struct + manual `sdsnew`/`sdsfree`        | Use `String` / `bytes::Bytes`                |
| `sha1.c` (inline SHA-1)        | 280-line hand-rolled SHA-1                      | Use `ring::digest::SHA1_FOR_LEGACY_USE_ONLY` |
| `dict.c` (custom hash table)   | Re-implemented open-addressing table            | Use `std::collections::HashMap`              |
| `redisObject` refcounted union | Manual refcount + `incrRefCount`/`decrRefCount` | Use `Rc`/`Arc` or `enum`                     |

The S.DEF has no way to say "this element is a C-language workaround; in a memory-safe target, omit it" or "this function re-implements SHA-1; use a vetted library instead." Consumer agents therefore default to 1:1 translation, producing functionally-correct but unnecessarily complex, unsafe, and unidiomatic code.

A second motivation: **paradigm mismatch.** If the source is functional (OCaml/Haskell) and the target is object-oriented (Java), the S.DEF currently cannot express "this `match` over a 7-variant ADT should be translated to a `switch` over a sealed class with exhaustive checking." Without explicit paradigm metadata, the consumer agent either copies the nested `if-instanceof` cascade or invents a translation that may be semantically lossy.

## Specification

### 1. New top-level field

```typescript
export interface SoftwareDefinition {
  // ... existing fields ...
  /** Reconstruction policy — cross-language/paradigm directives (PTDL). */
  reconstruction_policy?: ReconstructionPolicy;
}
```

### 2. New types

```typescript
/** Per-document cross-language/paradigm reconstruction policy. */
export interface ReconstructionPolicy {
  /** Default strategy for Tier C elements. Per-element `origin.override_strategy` wins. */
  default_tier_c_strategy?: "translate" | "preserve" | "omit";
  /** Default strategy for Tier D elements. */
  default_tier_d_strategy?: "translate" | "preserve" | "omit";

  /** Source-language paradigm fingerprint (Producer-inferred, may be human-overridden). */
  source_paradigm?: ParadigmMetadata;
  /** Target-language paradigm fingerprint (Consumer-provided or auto-detected). */
  target_paradigm?: ParadigmMetadata;

  /** Library substitution suggestions (Producer-inferred from dependency analysis). */
  library_substitutions?: LibrarySubstitution[];

  /** Paradigm translation rules. May be document-specific or referenced from a global pool. */
  transformation_hints?: TransformationHint[];

  /** Whether the Consumer may introduce dependencies that the original software did not use. Default: true. */
  allow_extra_dependencies?: boolean;

  /** Whether the Consumer may alter externally observable behavior. Default: false — behavior must be 1:1. */
  allow_behavior_drift?: boolean;
}

/** Language paradigm fingerprint. */
export interface ParadigmMetadata {
  /** Primary paradigm. */
  primary:
    | "imperative"
    | "object_oriented"
    | "functional"
    | "logic"
    | "procedural"
    | "scripting"
    | "systems"
    | "reactive"
    | "concurrent_actor";
  /** Optional secondary paradigm. */
  secondary?:
    | "object_oriented"
    | "functional"
    | "generic"
    | "reflection"
    | "metaprogramming";
  /** Memory management model. */
  memory_model: "manual" | "gc" | "rc" | "ownership" | "region";
  /** Type system strength. */
  type_system:
    | "dynamic"
    | "static_weak"
    | "static_strong"
    | "static_dependent"
    | "gradual";
  /** Default error-propagation idiom. */
  error_handling:
    | "exceptions"
    | "error_codes"
    | "result_type"
    | "panics"
    | "longjmp"
    | "multiple_values";
  /** Concurrency model. */
  concurrency:
    | "threads"
    | "async_await"
    | "actors"
    | "goroutines"
    | "event_loop"
    | "single_threaded";
  /** Whether the language has first-class functions / closures. */
  has_first_class_functions?: boolean;
  /** Whether the language has syntactic macros / compile-time code generation. */
  has_macros?: boolean;
  /** How unsafe operations (raw pointers, unions, FFI) are expressed. */
  unsafe_constructs?: "explicit_unsafe" | "implicit_everywhere" | "none";
}

/** Per-element reconstruction provenance — the four-tier classification. */
export interface ElementOrigin {
  /** Tier A: behavior contract (preserve 1:1). */
  /** Tier B: algorithm kernel (keep algorithm, swap data structures). */
  /** Tier C: implementation idiom (translate to target-language idioms). */
  /** Tier D: language-specific artifact (omit in target language). */
  reconstruction_class:
    | "behavior_contract"
    | "algorithm"
    | "idiom"
    | "incidental";
  /** Producer-inferred confidence in the 0.0–1.0 range. */
  confidence: number;
  /** Evidence used to make the classification. Free-form, audit-friendly. */
  evidence: string[];
  /** Human-readable rationale. */
  rationale: string;
  /** Optional per-element override of the document-level default strategy. */
  override_strategy?: "translate" | "preserve" | "omit";
}

/** Suggestion to replace an original implementation with a library in the target ecosystem. */
export interface LibrarySubstitution {
  /** Unique ID (also used in the symbol registry). */
  id: string;
  /** Signature of the function being replaced, in target-language notation. */
  function_signature: string;
  /** What the original software actually used. */
  original_implementation: {
    /** Display name (e.g. "SHA1", "zmalloc", "sds"). */
    name: string;
    /** Source file (e.g. "src/sha1.c"). */
    source_file?: string;
    /** Lines of code in the original implementation. */
    lines_of_code?: number;
    /** SPDX license identifier of the original. */
    license?: string;
  };
  /** Ranked candidates. Consumer picks the highest-trust one matching the target ecosystem. */
  candidates: LibraryCandidate[];
  /** Optional selection rule (DSL string). Default: pick highest-trust candidate. */
  selection_rule?: string;
}

/** A single library candidate for a substitution. */
export interface LibraryCandidate {
  /** Target package ecosystem. */
  ecosystem:
    | "rust_crate"
    | "npm"
    | "pypi"
    | "maven"
    | "go_module"
    | "java_jar"
    | "dotnet_nuget"
    | "std";
  /** Package / crate / module name. For `std`, this is the full path (e.g. "std::collections::HashMap"). */
  name: string;
  /** Version constraint (e.g. ">=0.17", "1.0", "*"). */
  version?: string;
  /** Why this candidate is recommended. */
  rationale: string;
  /** Known risks (e.g. "uses nightly-only feature", "has unmaintained dependencies"). */
  risks?: string[];
  /** Trust score in 0.0–1.0. Higher = stronger preference. */
  trust: number;
}

/** A source-pattern → target-pattern translation rule. */
export interface TransformationHint {
  /** Unique ID. */
  id: string;
  /** Source-side pattern (DSL, matched against S.DEF element characteristics). */
  source_pattern: string;
  /** Target-side pattern (DSL). */
  target_pattern: string;
  /** Human-readable transformation rule + pseudocode. */
  transformation: string;
  /** Paradigm pairs this rule applies to. */
  applies_to: {
    /** Source paradigm primary values. */
    source: string[];
    /** Target paradigm primary values. */
    target: string[];
  };
  /** Worked examples. */
  examples?: {
    /** S.DEF excerpt of the source pattern. */
    source_sdef_excerpt: string;
    /** Generated target code. */
    target_code: string;
  }[];
}
```

### 3. Element-level `origin` field

The `origin?: ElementOrigin` field is added to:

- `DataModel`
- `DataAttribute`
- `InterfaceContract`
- `ClassContract`
- `ApiContract`
- `ContractMethod` (because methods inside a class/interface can have different tiers from their parent)
- `FunctionSpec`

The `origin` field is always optional. When absent, the consumer agent should use a tier-appropriate default:

| Element type        | Default tier when `origin` is absent |
| ------------------- | ------------------------------------ |
| `DataModel`         | `behavior_contract` (preserve)       |
| `DataAttribute`     | `behavior_contract` (preserve)       |
| `InterfaceContract` | `behavior_contract`                  |
| `ClassContract`     | `idiom` (translate)                  |
| `ApiContract`       | `behavior_contract` (preserve)       |
| `ContractMethod`    | `behavior_contract`                  |
| `FunctionSpec`      | `algorithm`                          |

### 4. Tier semantics

| Tier | Class               | Default consumer action                     | Notes                                                                                                           |
| ---- | ------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| A    | `behavior_contract` | Preserve 1:1                                | API names, signatures, error cases, wire formats must be identical.                                             |
| B    | `algorithm`         | Translate body using target-language idioms | Algorithm kernel (RDB persistence, LRU, siphash) survives; data structures get swapped.                         |
| C    | `idiom`             | Translate using target-language idioms      | "Hash table" → `HashMap`; "raw string buffer" → `String`.                                                       |
| D    | `incidental`        | Omit                                        | Source-language workarounds (custom allocators, manual refcount, inline SHA-1). Never appear in generated code. |

`ReconstructionPolicy.default_tier_c_strategy` and `default_tier_d_strategy` provide the document-wide default. `ElementOrigin.override_strategy` overrides per element.

### 5. Validation constraints

- `ElementOrigin.confidence` must be in `[0.0, 1.0]`.
- `LibraryCandidate.trust` must be in `[0.0, 1.0]`.
- `LibrarySubstitution.candidates` must contain at least one entry.
- `LibrarySubstitution.candidates[*].ecosystem` values are restricted to the enum above; non-enum values cause consumer agents to fall back to the `std` ecosystem.
- `TransformationHint.applies_to.source` and `.target` must each be non-empty arrays of paradigm values.

## Rationale

### Why a separate `reconstruction_policy` block, not just a `reconstruction_rules` extension?

`reconstruction_rules` exists to express the **time dimension** (v1 vs v2 of the same software, compatibility modes, version targets). PTDL is about the **language dimension** (C vs Rust, OCaml vs Java). Conflating them would obscure the orthogonal nature of the two concerns and make it harder to express combinations like "compatibility_mode=full, allow_extra_dependencies=true".

### Why an element-level `origin` field, not just a document-level policy?

A document-level policy cannot express the fact that within redis 1.3.12, `SET` is a behavior contract (must preserve), `rdbSaveObject` is an algorithm (must translate), `dict` is an idiom (must translate), and `zmalloc` is incidental (must omit). The granularity needed is per-element, and putting it in `metadata.annotations` (already a `Record<string, unknown>`) would lose the structure that consumer agents need to reason about.

### Why four tiers and not two (essential / replaceable)?

Two tiers force a binary choice that does not match reality:

- "Essential" mixes **behavior contracts** (which must be 1:1) with **algorithms** (which can be re-implemented in target idioms). These are not the same kind of thing and consumer agents need to distinguish them.
- "Replaceable" mixes **idioms** (where the right action is "translate to the target language's equivalent") with **incidental artifacts** (where the right action is "delete entirely and let the target language fill the gap"). Treating these the same way produces poor output in both directions: "translate malloc" produces nonsense; "preserve raw string buffer" produces non-idiomatic code.

### Why a separate `LibrarySubstitution` rather than enriching `Dependency`?

`Dependency` is a runtime dependency that the original software already uses. `LibrarySubstitution` is a **suggested replacement** for code that the original software _implemented_ itself. The two are structurally different: a `Dependency` says "use bcrypt@5.1", a `LibrarySubstitution` says "you don't need to write SHA-1 yourself, use `ring` instead." Mixing them would require `Dependency` to grow a `replaces_implementation` discriminator and would make downstream queries harder.

### Why include `ParadigmMetadata` rather than just `language_family`?

`reconstruction_rules.tech_constraints.language_family` already exists, but it is a string (e.g. `"rust"`) and provides no information about _how_ the language behaves. For cross-language translation we need to know that, e.g., Rust's `Result<T, E>` maps to Java's checked exceptions in one direction and unchecked exceptions in another. That is paradigm information, not family information.

## Backward Compatibility

This proposal is **fully backward compatible**:

- All new fields are optional.
- `reconstruction_policy` is a new optional field on `SoftwareDefinition`; existing documents continue to validate.
- `origin` is a new optional field on six entity types; existing documents continue to validate.
- No existing field is renamed, removed, or had its type changed.
- No existing field's semantics is altered.

Existing consumer agents that do not understand PTDL will simply ignore the new fields and continue to operate as before. New consumer agents that do understand PTDL will gain the ability to avoid source-language artifacts when they are described in the S.DEF.

No data migration is required for existing S.DEF documents. They remain valid as-is; they simply do not benefit from PTDL until they are re-analyzed by a PTDL-aware Producer.

## Security Implications

- **Library substitution trust**: The `trust` field on `LibraryCandidate` is a Producer-inferred score. If a malicious Producer inflates trust scores, a Consumer could be steered toward an attacker-controlled crate. Mitigations: (1) Consumer agents should always re-validate `trust` against their own allow-list before applying substitutions; (2) the schema should not allow `trust` values outside `[0.0, 1.0]`; (3) SDEF validators in downstream tools should flag unusually high `trust` values for low-quality candidates.
- **Behavior drift**: `allow_behavior_drift: true` is an explicit opt-in. Default is `false`. Consumer agents must respect this default and never silently enable drift.
- **Dependency confusion**: The `ecosystem` enum is open-ended enough to cover all major package systems but does not specify package source. A malicious Producer could specify a private registry. Mitigations: Consumer agents should resolve candidates against the canonical package registry for the declared ecosystem, not against arbitrary URLs.

## Reference Implementation

A reference implementation is being developed in the `cleanroom-agent` workspace under `docs/19-reconstruction-quality.md`. It covers:

- Producer-side `ElementClassifier` and `ParadigmDetector` (in `crates/cleanroom-agent/src/producer/`).
- Consumer-side `StrategySelector` and `LibraryReplacer` (in `crates/cleanroom-agent/src/consumer/`).
- An end-to-end walkthrough using `redis 1.3.12 → Rust` as a worked example (§8 of the design doc).

The reference implementation is required before this proposal can advance to "Final" status.

---

## Additional Optional Sections

### Alternatives Considered

1. **Extend `metadata.annotations` with free-form keys.** Rejected because consumer agents need structured, validated fields to reason about reconstruction. Free-form keys are not actionable.

2. **Add a single `reconstruction_class` field at the document level.** Rejected because the granularity needed is per-element, not per-document.

3. **Encode PTDL as a separate S.DEF "reconstruction manifest" rather than a field on `SoftwareDefinition`.** Rejected because it would split related information across two documents and complicate atomicity guarantees. A document + its PTDL are inseparable.

4. **Let the Consumer agent decide what is incidental.** Rejected because (1) without explicit guidance, the LLM defaults to 1:1 translation, (2) the decision needs to be auditable and reproducible, and (3) the Producer is the only one with the evidence to make the classification.

### Open Questions

- Should `ReconstructionPolicy` also include a `target_quality_level` (e.g. "production_equivalent", "best_practice") to distinguish "build something that works" from "build something that improves on the original"? Current draft leaves this out; could be added in a follow-up proposal if community signals interest.
- Should `TransformationHint` live inside the document (current draft) or be a separate globally-addressable pool (`sdef://hints/c_to_rust/match_to_switch`)? Current draft allows both via the optional `document_name` field on the table backing it.
- How should the schema express "this data model is a wire format that must remain byte-identical"? This is a stronger guarantee than `behavior_contract` and is partially captured by `allow_behavior_drift: false` + `origin.confidence: 1.0`, but a dedicated `wire_format: true` field on `DataModel` may be cleaner. Deferred to a future proposal.

### Acknowledgments

This proposal was developed in the context of the cleanroom-agent project, which uses redis 1.3.12 as its primary cross-language benchmark. The four-tier classification was inspired by the standard taxonomy of software defects (Boehm 1987) and the "essential vs. accidental complexity" distinction from Brooks's _The Mythical Man-Month_.
