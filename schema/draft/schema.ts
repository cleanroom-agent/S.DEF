/**
 * S.DEF Schema — Draft
 *
 * This is the canonical TypeScript definition of the Software Definition Exchange Format.
 * The JSON Schema representation is generated from this file.
 *
 * The format captures **what** software does and **why** — not how it is implemented.
 * It enables programming agents to exchange software design knowledge and reconstruct
 * functionally equivalent systems from scratch in any technology stack.
 *
 * @example ./examples/full.json SoftwareDefinition
 */

// ============================================================================
// Root Definition
// ============================================================================

/**
 * The root object of any S.DEF document.
 *
 * Contains all layers of software description: system boundary, domain model,
 * architecture, data models, contracts, behavior, UI, tests, design decisions,
 * reconstruction rules, dependencies, and deployment requirements.
 */
export interface SoftwareDefinition {
  /** Schema version (date-based, e.g. "2026-05-27"). */
  sdef_version: string;
  /** The software identifier (e.g. "com.example.todoapp"). */
  name: string;
  /** Human-readable description. */
  description?: string;
  /** Version of the software being described. */
  version?: string;

  /** Metadata associated with the software. */
  metadata?: SoftwareMetadata;
  /** System boundary — what the software does and does NOT do. */
  system_boundary?: SystemBoundary;
  /** Design decisions with rationale. */
  design_decisions?: DesignDecision[];
  /** Version history — tracks the evolution of the software over time. */
  version_history?: VersionRecord[];

  /** Domain model — business concepts, rules, and processes. */
  domain?: Domain;

  /** Architecture — structural layers, modules, and communication patterns. */
  architecture?: Architecture;
  /** Data model — entities, their attributes, relationships, and validation rules. */
  data_models?: DataModel[];
  /** Contracts — interfaces, classes, enums, and API endpoints. */
  contracts?: Contracts;

  /** Behavior — functions, flows, and state machines. */
  behavior?: Behavior;
  /** User interface — screens, components, interactions, and navigation. */
  ui?: UserInterface;

  /** Test contracts — unit tests, integration tests, and acceptance criteria. */
  tests?: TestContract;
  /** Reconstruction rules — fidelity target, technology constraints, and directives. */
  reconstruction_rules?: ReconstructionRules;
  /**
   * Reconstruction policy (PTDL) — cross-language/paradigm directives that tell
   * the consumer agent which S.DEF elements are source-language implementation
   * artifacts and should be omitted, replaced, or translated when rebuilding
   * in a different language or paradigm.
   *
   * Orthogonal to `reconstruction_rules`, which handles the time dimension
   * (v1 vs v2); this handles the language dimension (C vs Rust, OCaml vs Java).
   */
  reconstruction_policy?: ReconstructionPolicy;

  /** External software dependencies (packages, services). */
  dependencies?: Dependency[];
  /** Deployment and runtime requirements. */
  deployment?: Deployment;
  /** Resources the software provides or consumes. */
  resources?: Resource[];
}

// ============================================================================
// Metadata
// ============================================================================

export interface SoftwareMetadata {
  /** Author / maintainer information. */
  authors?: Author[];
  /** Software license identifier (SPDX). */
  license?: string;
  /** Homepage URL. */
  homepage?: string;
  /** Source code repository URL. */
  repository?: string;
  /** Category (e.g. "web_application", "library", "cli_tool"). */
  category?: string;
  /** Tags for categorization. */
  tags?: string[];
  /** Target platforms (e.g. "web", "mobile", "desktop", "embedded"). */
  target_platforms?: string[];
  /** Compatibility policy (e.g. "none", "active", "full"). */
  compatibility_policy?: string;
  /** Arbitrary annotations for extensibility. */
  annotations?: Record<string, unknown>;
}

export interface Author {
  name: string;
  email?: string;
  url?: string;
}

// ============================================================================
// System Boundary
// ============================================================================

/**
 * Defines the scope of the software — what it does, what it explicitly does NOT do,
 * who the target users are, and the success criteria.
 *
 * The `non_goals` field is a critical guardrail: it prevents a reconstruction agent
 * from over-implementing features that were intentionally excluded.
 */
export interface SystemBoundary {
  /** The core purpose of the software in one sentence. */
  core_purpose: string;
  /** Target user personas. */
  target_users?: string[];
  /** Features that are in scope. */
  in_scope?: string[];
  /** Features explicitly out of scope (prevents over-implementation). */
  non_goals?: string[];
  /** Measurable success criteria (e.g. "page load < 200ms"). */
  success_criteria?: string[];
  /** Constraints (performance, compatibility, security, accessibility). */
  constraints?: Constraint[];
  /** External dependencies at the system level (APIs, services). */
  external_dependencies?: string[];
}

export interface Constraint {
  /** Constraint category (e.g. "performance", "compatibility", "security"). */
  category: string;
  /** Constraint description. */
  description: string;
}

// ============================================================================
// Design Decisions
// ============================================================================

/**
 * A record of a design decision, its context, alternatives considered,
 * rationale, and consequences.
 *
 * Every significant architectural or design choice should be captured here.
 */
export interface DesignDecision {
  /** Unique identifier for this decision. */
  id: string;
  /** The topic / area this decision applies to. */
  topic: string;
  /** The chosen approach. */
  decision: string;
  /** Why this approach was chosen. */
  rationale: string;
  /** The context in which the decision was made. */
  context?: string;
  /** Alternatives that were considered. */
  alternatives?: string[];
  /** Consequences (both positive and negative). */
  consequences?: string[];
  /** Additional constraints imposed by this decision. */
  constraints?: string[];
}

// ============================================================================
// Versioning & Compatibility
// ============================================================================

/**
 * A record of a software version, capturing what changed and how
 * backward compatibility was (or wasn't) maintained.
 *
 * This enables consumer agents to understand the evolution of the software
 * and make informed decisions about which compatibility layers to include.
 */
export interface VersionRecord {
  /** Version identifier (e.g. "1.0.0", "2.0.0"). */
  version: string;
  /** Release date. */
  release_date?: string;
  /** Whether this version is deprecated. */
  deprecated?: boolean;
  /** When this version reaches end-of-life. */
  eol_date?: string;
  /** Breaking changes introduced in this version. */
  breaking_changes?: string[];
  /** Notes on backward compatibility. */
  compatibility_notes?: string;
}

/**
 * Deprecation metadata — marks an interface, class, data entity, or method
 * as superseded by a newer version.
 *
 * Consumer agents use this to decide whether to generate the element:
 * - `include_compatibility: false` → skip all deprecated elements
 * - `include_compatibility: true` → generate with deprecation annotations
 */
export interface DeprecationInfo {
  /** Version in which this element was deprecated. */
  since_version?: string;
  /** Reference to the element that replaces this one (e.g. entity name or interface ID). */
  replaced_by?: string;
  /** Version in which this element is planned (or was) removed. */
  removal_version?: string;
  /** Guidance for migrating from this element to its replacement. */
  migration_guide?: string;
}

/**
 * Compatibility mapping — describes how a legacy element (API, data field)
 * maps to the current version's equivalent.
 *
 * This is used by consumer agents when generating adapter/forwarder code.
 */
export interface CompatibilityMapping {
  /** The target element this one forwards to. */
  maps_to?: string;
  /** Mapping of legacy field names to current field names. */
  field_mapping?: Record<string, string>;
  /** Description of the transformation logic in pseudocode. */
  transform_logic?: string;
  /** Whether the mapping is bidirectional. */
  bidirectional?: boolean;
}

/**
 * Data migration specification — describes how to convert data
 * from an older schema version to the current schema.
 */
export interface DataMigration {
  /** Unique identifier. */
  id: string;
  /** Description. */
  description?: string;
  /** Source entity name (old version). */
  from_entity: string;
  /** Target entity name (new version). */
  to_entity: string;
  /** Source version. */
  from_version?: string;
  /** Target version. */
  to_version?: string;
  /** Pseudocode describing the migration algorithm. */
  algorithm?: string;
}

// ============================================================================
// Domain Layer
// ============================================================================

/**
 * The Domain Layer describes the business problem domain — the concepts,
 * rules, and processes that the software models and automates.
 *
 * This is the anchor for all other layers: code and data structures exist
 * to operate on these business concepts.
 */
export interface Domain {
  /** Business concepts — the nouns of the domain. */
  business_concepts?: BusinessConcept[];
  /** Business rules — conditions and actions. */
  business_rules?: BusinessRule[];
  /** Business processes — multi-stage workflows. */
  business_processes?: BusinessProcess[];
}

export interface BusinessConcept {
  /** Unique identifier for this concept. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Description of what this concept represents. */
  description?: string;
  /** Key attributes of this concept. */
  attributes?: TypedAttribute[];
  /** Relationships to other business concepts. */
  relationships?: ConceptRelationship[];
  /** Invariants that must always hold true. */
  invariants?: string[];
}

export interface TypedAttribute {
  name: string;
  /** Abstract type (e.g. "UUID", "string", "boolean", "timestamp"). */
  type: string;
  description?: string;
  domain?: string;
}

export interface ConceptRelationship {
  /** Role of this relationship (e.g. "created by", "contains"). */
  role: string;
  /** Target business concept ID. */
  target: string;
  /** Cardinality (e.g. "1:1", "1:N", "M:N"). */
  cardinality?: string;
}

export interface BusinessRule {
  /** Unique identifier. */
  id: string;
  /** Rule name. */
  name: string;
  /** Description of the rule. */
  description?: string;
  /** The condition that triggers this rule. */
  condition: string;
  /** The action to take when the condition is met. */
  action: string;
  /** Priority (e.g. "high", "medium", "low"). */
  priority?: string;
}

export interface BusinessProcess {
  /** Unique identifier. */
  id: string;
  /** Process name. */
  name: string;
  /** Description. */
  description?: string;
  /** The stages of this process. */
  stages?: ProcessStage[];
  /** Exception handling scenarios. */
  exception_handling?: ExceptionHandler[];
}

export interface ProcessStage {
  /** Stage identifier (e.g. "creation", "payment"). */
  stage: string;
  /** Human-readable name for this stage. */
  name?: string;
  /** Condition that triggers entry into this stage. */
  entry_condition?: string;
  /** Actions performed in this stage. */
  actions?: string[];
  /** Condition that must be met to exit this stage. */
  exit_condition?: string;
}

export interface ExceptionHandler {
  /** The scenario that triggers the exception. */
  scenario: string;
  /** The action to take. */
  action: string;
}

// ============================================================================
// Architecture
// ============================================================================

/**
 * The Architecture describes the high-level structure of the software —
 * layers, modules, components, and communication patterns.
 */
export interface Architecture {
  /** Architectural style (e.g. "layered", "microservices", "event-driven", "hexagonal"). */
  style?: string;
  /** Why this style was chosen. */
  rationale?: string;
  /** Structural layers. */
  layers?: ArchitectureLayer[];
  /** Modules — units of related functionality. */
  modules?: ArchitectureModule[];
  /** Communication patterns between parts of the system. */
  communication?: CommunicationPattern[];
  /** Cross-cutting concerns (logging, error handling, auth). */
  cross_cutting_concerns?: CrossCuttingConcern[];
}

export interface ArchitectureLayer {
  name: string;
  /** Components within this layer. */
  components?: string[];
}

export interface ArchitectureModule {
  /** Unique module identifier. */
  name: string;
  /** What this module is responsible for. */
  responsibility?: string;
  /** What this module exports / provides. */
  exports?: string[];
  /** Other modules this module depends on. */
  depends_on?: string[];
  /** The components within this module. */
  components?: ModuleComponent[];
}

export interface ModuleComponent {
  name: string;
  /** Component type (e.g. "service", "controller", "repository", "model"). */
  type: string;
  description?: string;
}

export interface CommunicationPattern {
  /** Sync or async pattern descriptor. */
  type: string;
  /** Description (e.g. "REST over HTTP", "RabbitMQ messages"). */
  description?: string;
}

export interface CrossCuttingConcern {
  /** Concern name (e.g. "logging", "error_handling"). */
  name: string;
  /** How it is addressed. */
  description: string;
}

// ============================================================================
// Data Models
// ============================================================================

/**
 * A Data Model describes a data entity — its logical meaning,
 * physical representation, attributes, relationships, and validation rules.
 */
export interface DataModel {
  /** Entity name (e.g. "User", "Order"). */
  entity: string;
  /** Lifecycle status: "active" (current), "deprecated", "legacy". */
  status?: string;
  /** Version this entity was introduced in. */
  version?: string;
  /** Deprecation metadata. */
  deprecated?: DeprecationInfo;
  /** What this entity represents in the domain. */
  description?: string;
  /** The logical model — business meaning in natural language. */
  logical_model?: string;
  /** The attributes of this entity. */
  attributes?: DataAttribute[];
  /** Relationships to other entities. */
  relationships?: DataRelationship[];
  /** Validation rules that apply to this entity. */
  validation_rules?: string[];
  /** Physical design hints (indexes, primary key). */
  physical_design?: PhysicalDesign;
  /**
   * Reconstruction provenance — classifies this entity into one of four tiers
   * (behavior_contract / algorithm / idiom / incidental) so the consumer
   * agent knows how to handle it during cross-language reconstruction.
   */
  origin?: ElementOrigin;
}

export interface DataAttribute {
  name: string;
  /** Logical type (e.g. "UUID", "string", "boolean", "timestamp", "Decimal"). */
  type: string;
  /** A format hint (e.g. "email", "uri", "uuid"). */
  format?: string;
  description?: string;
  required?: boolean;
  /** Default value. */
  default?: unknown;
  /** Whether this is the identity / primary key. */
  identity?: boolean;
  /** Whether this value is auto-generated. */
  generated?: boolean;
  /** Whether this value is unique. */
  unique?: boolean;
  /** Whether this is internal (not exposed to clients). */
  internal?: boolean;
  /** Whether this field is deprecated (retained for compat). */
  deprecated?: boolean;
  /** How this legacy field maps to the current schema. */
  compatibility?: CompatibilityMapping;
  /** Constraints (e.g. "max_length:200", "non_empty"). */
  constraints?: string[];
  /**
   * Reconstruction provenance — see [`ElementOrigin`]. Tier D for an attribute
   * means the consumer should drop the field entirely (e.g. a C-specific
   * `refcount` field has no Rust equivalent).
   */
  origin?: ElementOrigin;
}

export interface DataRelationship {
  /** Relationship kind (e.g. "belongs_to", "has_many", "many_to_many"). */
  kind: string;
  /** Target entity name. */
  target: string;
  /** Foreign key column name. */
  foreign_key?: string;
  /** Join table for many-to-many. */
  join_table?: string;
  /** On-delete behavior (e.g. "cascade", "restrict"). */
  on_delete?: string;
}

export interface PhysicalDesign {
  /** Primary key field(s). */
  primary_key?: string;
  /** Index definitions. */
  indexes?: IndexDefinition[];
}

export interface IndexDefinition {
  fields: string[];
  type?: string;
}

// ============================================================================
// Contracts
// ============================================================================

/**
 * The Contracts section defines the interfaces, classes, enums,
 * and API endpoints that form the software's public contract.
 *
 * This is the "contract-first" core: everything is described by its
 * input/output signatures, behavior, pre/post conditions, and error cases.
 */
export interface Contracts {
  /** Abstract interfaces. */
  interfaces?: InterfaceContract[];
  /** Concrete classes. */
  classes?: ClassContract[];
  /** Enumerations. */
  enums?: EnumContract[];
  /** API endpoints (REST, gRPC, etc.). */
  apis?: ApiContract[];
  /** Compatibility modules — isolated modules that exist only for backward compat. */
  compatibility_modules?: CompatibilityModule[];
  /** Data migration specifications. */
  data_migrations?: DataMigration[];
}

/**
 * A compatibility module is an isolated set of interfaces, classes, or APIs
 * that exist solely to maintain backward compatibility with older versions.
 *
 * Consumer agents can optionally exclude these when generating clean code.
 */
export interface CompatibilityModule {
  /** Module identifier. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Description. */
  description?: string;
  /** The versions this module provides compatibility for. */
  targets_versions?: string[];
  /** Interfaces in this compat module. */
  interfaces?: string[];
  /** Functions in this compat module. */
  functions?: string[];
}

export interface InterfaceContract {
  name: string;
  /** Indicates this is abstract and must be implemented. */
  is_abstract?: boolean;
  /** Lifecycle status: "active" (current), "deprecated", "legacy". */
  status?: string;
  /** Version this interface was introduced in. */
  version?: string;
  /** Deprecation metadata. */
  deprecated?: DeprecationInfo;
  /** Description. */
  description?: string;
  /** Methods defined on this interface. */
  methods?: ContractMethod[];
  /** Invariants that all implementations must maintain. */
  invariants?: string[];
  /**
   * Reconstruction provenance — see [`ElementOrigin`]. Tier C (idiom) is the
   * common case for interfaces implemented as classes in the source language.
   */
  origin?: ElementOrigin;
}

export interface ClassContract {
  name: string;
  /** Lifecycle status: "active" (current), "deprecated", "legacy". */
  status?: string;
  /** Version this class was introduced in. */
  version?: string;
  /** Deprecation metadata. */
  deprecated?: DeprecationInfo;
  /** Description. */
  description?: string;
  /** Interfaces this class implements. */
  implements?: string[];
  /** Other contracts this class depends on. */
  dependencies?: string[];
  /** Methods defined on this class. */
  methods?: ContractMethod[];
  /**
   * Reconstruction provenance — see [`ElementOrigin`]. Tier D for a class is
   * common when the class is a C-language workaround (e.g. a manually
   * refcounted union type) that has no equivalent in a memory-safe target.
   */
  origin?: ElementOrigin;
}

export interface ContractMethod {
  /** Method signature (e.g. "create_task(input: CreateTaskInput) -> Task"). */
  signature: string;
  /** Lifecycle status: "active" (current), "deprecated", "legacy". */
  status?: string;
  /** Deprecation metadata. */
  deprecated?: DeprecationInfo;
  /** Behavioral description in natural language. */
  behavior?: string;
  /** Conditions that must be true before calling. */
  preconditions?: string[];
  /** Conditions guaranteed true after execution. */
  postconditions?: string[];
  /** Error cases. */
  errors?: string[];
  /**
   * Reconstruction provenance — see [`ElementOrigin`]. Tier A (behavior
   * contract) is the default; methods of public API contracts should not
   * be classified as D unless the contract itself is deprecated.
   */
  origin?: ElementOrigin;
}

export interface EnumContract {
  name: string;
  description?: string;
  /** Deprecation metadata. */
  deprecated?: DeprecationInfo;
  /** Enumeration values. */
  values: string[];
}

export interface ApiContract {
  /** HTTP method or protocol operation (e.g. "POST", "GET"). */
  method: string;
  /** API path (e.g. "/api/v1/tasks"). */
  path: string;
  /** Auth requirement (e.g. "bearer_jwt", "none"). */
  auth?: string;
  /** Lifecycle status: "active" (current), "deprecated", "legacy". */
  status?: string;
  /** Deprecation metadata. */
  deprecated?: DeprecationInfo;
  /** Compatibility layer — how this legacy API maps to the current one. */
  compatibility?: CompatibilityMapping;
  /** Description. */
  description?: string;
  /** Request specification. */
  request?: ApiRequest;
  /** Response specification keyed by status code. */
  response?: Record<string, ApiResponse>;
  /** Behavioral description. */
  behavior?: string;
  /** Side effects of this API call. */
  side_effects?: string[];
  /** Rate limiting (e.g. "100 req/min per user"). */
  rate_limit?: string;
  /**
   * Reconstruction provenance — see [`ElementOrigin`]. Wire-format APIs (e.g.
   * RESP, gRPC method signatures) should be Tier A with `confidence >= 0.95`.
   */
  origin?: ElementOrigin;
}

export interface ApiRequest {
  /** Request body schema. */
  body?: Record<string, unknown>;
  /** Request headers. */
  headers?: Record<string, string>;
  /** Validation rules. */
  validation_rules?: string[];
}

export interface ApiResponse {
  /** Response body type or schema. */
  body?: unknown;
  /** Response description. */
  description?: string;
}

// ============================================================================
// Behavior
// ============================================================================

/**
 * The Behavior section describes the dynamic aspects of the software:
 * function signatures with pseudocode logic, complex multi-participant
 * flows, and state machines.
 */
export interface Behavior {
  /** Function specifications. */
  functions?: FunctionSpec[];
  /** Complex multi-step flows (orchestration level). */
  flows?: FlowSpec[];
  /** State machines for key entities. */
  state_machines?: StateMachine[];
}

export interface FunctionSpec {
  /** Function name. */
  name: string;
  /** What this function does. */
  description?: string;
  /** Input parameters. */
  inputs?: FunctionParam[];
  /** Output values. */
  outputs?: FunctionParam[];
  /** Pseudocode logic (using S.DEF standard pseudocode syntax). */
  logic?: string;
  /** Computational complexity (e.g. "O(n)"). */
  complexity?: string;
  /** Whether this function is pure (no side effects). */
  pure_function?: boolean;
  /** Edge cases and their expected behavior. */
  edge_cases?: EdgeCase[];
  /**
   * Reconstruction provenance — see [`ElementOrigin`]. Tier B (algorithm) is
   * the default for non-trivial functions. Tier D applies to functions that
   * exist only as language-specific workarounds.
   */
  origin?: ElementOrigin;
}

export interface FunctionParam {
  name: string;
  /** Logical type. */
  type: string;
  description?: string;
}

export interface EdgeCase {
  /** The edge case condition. */
  condition: string;
  /** Expected behavior. */
  expected_behavior: string;
}

export interface FlowSpec {
  /** Flow identifier. */
  id: string;
  /** Flow name. */
  name: string;
  description?: string;
  /** Orchestration or primitive level. */
  level?: string;
  /** Participants in this flow. */
  participants?: FlowParticipant[];
  /** Step-by-step flow definition. */
  steps?: FlowStep[];
  /** Compensation strategy if rollback is needed. */
  compensation?: CompensationStrategy;
}

export interface FlowParticipant {
  /** Role name (e.g. "OrderService"). */
  role: string;
  /** Participant type (e.g. "service", "infrastructure"). */
  type: string;
}

export interface FlowStep {
  /** Step number (ordering). */
  step: number;
  /** The participant performing this step. */
  actor: string;
  /** Action description. */
  action: string;
  /** Input data. */
  input?: string;
  /** Output data. */
  output?: string;
  /** Error handling for this step. */
  error_handling?: FlowErrorHandler[];
}

export interface FlowErrorHandler {
  /** Error condition. */
  condition: string;
  /** Action on error. */
  action: string;
}

export interface CompensationStrategy {
  /** Description of compensation logic. */
  description: string;
  /** Action to take for compensation. */
  action: string;
}

export interface StateMachine {
  /** The entity this state machine applies to. */
  entity: string;
  /** Possible states. */
  states: string[];
  /** State transitions. */
  transitions?: StateTransition[];
}

export interface StateTransition {
  /** Source state. */
  from: string;
  /** Target state. */
  to: string;
  /** Event that triggers the transition. */
  trigger?: string;
  /** Guard conditions that must be true. */
  guard_conditions?: string[];
}

// ============================================================================
// User Interface
// ============================================================================

/**
 * The UI section describes the user-facing aspects of the software.
 *
 * **Three layers of UI description (choose one or combine):**
 *
 * 1. **Design System** (`design_system`) — design tokens, colors, typography,
 *    spacing, shadows, themes. Higher-level than raw CSS; reusable across screens.
 *    Adapted from the Pen format's variable system.
 *
 * 2. **Pen-compatible Visual Document** (`document`) — a JSON object tree
 *    compatible with the [Pen format](https://docs.pencil.dev/for-developers/the-pen-format).
 *    Uses flexbox layout, fills/strokes/effects, components+instances+slots.
 *    Best for pixel-level visual fidelity. Extended with S.DEF semantic fields
 *    (`sdefBindings`, `sdefBehaviors`, `sdefStates`, etc.).
 *
 * 3. **Abstract Screens** (`screens`) — simplified semantic screen descriptions
 *    without pixel values. Best for intent-level descriptions and quick prototyping.
 *
 * @see https://docs.pencil.dev/for-developers/the-pen-format
 */
export interface UserInterface {
  /** Design system — tokens, themes, and style primitives (adapted from the Pen format). */
  design_system?: UIDesignSystem;
  /** Pen-compatible visual document with S.DEF extensions. */
  document?: UIDocument;
  /** Abstract screen definitions — simpler, intent-focused. */
  screens?: UIScreen[];
  /** Navigation definition. */
  navigation?: UINavigation;
  /** Responsive design breakpoints. */
  responsive_design?: ResponsiveBreakpoint[];
  /** Component taxonomy (reusable component library). */
  component_taxonomy?: UIComponentType[];
}

// ============================================================================
// Layer 1: Design System (Tokens & Themes)
// ============================================================================

/**
 * A Design System defines the atomic visual primitives — colors, typography,
 * spacing, shadows, motion, border radius — as named tokens that everything
 * else references.
 *
 * Inspired by the Pen format's variable system.
 */
export interface UIDesignSystem {
  /** Color tokens. Values can be hex colors, or references to other tokens via `$name`. */
  colors?: Record<string, string>;
  /** Typography tokens. */
  typography?: UIDesignTypography;
  /** Spacing tokens (e.g. `"spacing.sm": "8px"`). */
  spacing?: Record<string, string>;
  /** Border radius tokens. */
  border_radius?: Record<string, string>;
  /** Shadow tokens. */
  shadows?: Record<string, string>;
  /** Motion / animation tokens. */
  motion?: UIDesignMotion;
  /** Theme configurations (e.g. light/dark). */
  themes?: UIDesignTheme[];
}

export interface UIDesignTypography {
  /** Font family tokens. */
  font_families?: Record<string, string>;
  /** Font size tokens. */
  font_sizes?: Record<string, string>;
  /** Font weight tokens. */
  font_weights?: Record<string, string>;
  /** Line height tokens. */
  line_heights?: Record<string, string>;
}

export interface UIDesignMotion {
  /** Duration tokens (e.g. `"duration.fast": "150ms"`). */
  durations?: Record<string, string>;
  /** Easing curve tokens. */
  easings?: Record<string, string>;
}

export interface UIDesignTheme {
  /** Theme name (e.g. "light", "dark"). */
  name: string;
  /** Token overrides for this theme. Key = token name, value = new value. */
  overrides?: Record<string, string>;
}

// ============================================================================
// Layer 2: Pen-compatible Visual Document with S.DEF Extensions
// ============================================================================

/**
 * A Pen-compatible UI document — a JSON object tree similar to SVG/HTML
 * but designed for UI design tools and AI consumption.
 *
 * Compatible with the [Pen format](https://docs.pencil.dev/for-developers/the-pen-format).
 * All visual elements extend `UIBaseElement`.
 *
 * S.DEF adds semantic extension fields prefixed with `sdef` to standard Pen
 * elements — these are ignored by standard Pen parsers but provide essential
 * context for AI agents (data binding, behaviors, states, accessibility, tests).
 */
export interface UIDocument {
  /** Pen format version (e.g. "2.11"). */
  version?: string;
  /** Document variables (Pen-compatible). */
  variables?: Record<string, UIVariable>;
  /** Theme axis definitions (Pen-compatible). */
  themes?: Record<string, string[]>;
  /** Top-level visual elements. */
  children: UINode[];
}

export interface UIVariable {
  type: "boolean" | "color" | "number" | "string";
  value: unknown;
}

// ---- Base Element ----

/**
 * Base entity shared by all Pen visual elements.
 * Every element has a unique `id`, a `type`, and optional position/size.
 */
export interface UIBaseElement {
  /** Unique string identifier within the document. */
  id: string;
  /** Human-readable name. */
  name?: string;
  /** Element type: "frame", "rectangle", "ellipse", "path", "text", "ref", "icon_font", "group". */
  type: string;
  /** X position relative to parent top-left. */
  x?: number;
  /** Y position relative to parent top-left. */
  y?: number;
  /** Width (number, or sizing behavior like "fill_container", "fit_content"). */
  width?: unknown;
  /** Height. */
  height?: unknown;
  /** When true, this element becomes a reusable component. */
  reusable?: boolean;
  /** Theme configuration applied to this element and its children. */
  theme?: Record<string, string>;
  /** Opacity (0-1). */
  opacity?: number;
  /** Rotation in degrees CCW. */
  rotation?: number;
  /** Whether this element is enabled/visible. */
  enabled?: boolean;

  /** Fill(s) — solid color, gradient, or image. */
  fill?: unknown;
  /** Stroke (border). */
  stroke?: UIStroke;
  /** Effect(s) — blur, shadow, etc. */
  effect?: unknown;
  /** Child elements. */
  children?: UINode[];

  // ---- S.DEF Extension Fields (ignored by standard Pen parsers) ----

  /** Data binding — links this element to a data model entity field. */
  sdefBindings?: UIDataBinding[];
  /** Interaction behaviors — user actions that trigger business logic. */
  sdefBehaviors?: UIBehavior[];
  /** Visual states — how this element changes under different conditions. */
  sdefStates?: UIVisualState[];
  /** Accessibility requirements. */
  sdefAccessibility?: UIAccessibility;
  /** Test hook identifier for automated UI testing. */
  sdefTestHook?: string;
  /** Navigation target when this element is activated. */
  sdefNavigation?: UINavTarget;
}

export interface UIStroke {
  /** Stroke alignment ("inside", "center", "outside"). */
  align?: string;
  /** Stroke thickness. */
  thickness?: number;
  /** Stroke fill (color). */
  fill?: unknown;
}

// ---- S.DEF Semantic Extensions ----

/**
 * Data binding — links a UI element property to a data entity field.
 * Enables one-way (display) or two-way (edit) data flow.
 */
export interface UIDataBinding {
  /** The entity name (matches a DataModel.entity). */
  entity: string;
  /** The entity field name. */
  field: string;
  /** Binding direction: "one_way" (read only) or "two_way" (read/write). */
  direction?: "one_way" | "two_way";
}

/**
 * Interaction behavior — a user action that triggers a business operation.
 */
export interface UIBehavior {
  /** Event that triggers this behavior (e.g. "click", "submit", "focus", "enter"). */
  on: string;
  /** Action to perform. Can be a contract reference or a built-in action. */
  action: string;
  /** Parameters passed to the action. */
  parameters?: Record<string, unknown>;
  /** What happens on success. */
  on_success?: UIBehaviorOutcome;
  /** What happens on error. */
  on_error?: UIBehaviorOutcome;
}

export interface UIBehaviorOutcome {
  /** Outcome action type (e.g. "navigate", "refresh", "show_message", "close"). */
  action?: string;
  /** Target for navigation actions. */
  target?: string;
  /** Message for show_message actions. */
  message?: string;
}

/**
 * Visual state — how the element changes under a specific condition.
 */
export interface UIVisualState {
  /** State name (e.g. "loading", "error", "disabled", "active", "hover"). */
  name: string;
  /** Condition that triggers this state. */
  condition?: UIVisualStateCondition;
  /** Property overrides when this state is active. */
  properties?: Record<string, unknown>;
}

export interface UIVisualStateCondition {
  /** The binding field to evaluate. */
  binding?: string;
  /** Comparison operator. */
  operator?:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "contains";
  /** Comparison value. */
  value?: unknown;
}

/**
 * Accessibility metadata for the element.
 */
export interface UIAccessibility {
  /** ARIA label for screen readers. */
  aria_label?: string;
  /** ARIA role. */
  aria_role?: string;
  /** Keyboard shortcut. */
  keyboard_shortcut?: string;
  /** Screen reader description text. */
  screen_reader_text?: string;
}

/**
 * Navigation target when this element is activated.
 */
export interface UINavTarget {
  /** Target screen ID or route. */
  target_screen?: string;
  /** Parameters to pass. */
  parameters?: Record<string, string>;
}

// ---- Pen-compatible Element Types ----

/**
 * Container element with flexbox layout.
 * Analogous to Pen's `frame` type.
 */
export interface UIFrame extends UIBaseElement {
  type: "frame";
  /** Flex layout direction ("vertical", "horizontal", "none"). */
  layout?: "none" | "vertical" | "horizontal";
  /** Gap between children. */
  gap?: number;
  /** Padding. */
  padding?: number | [number, number] | [number, number, number, number];
  /** Main-axis alignment ("start", "center", "end", "space_between", "space_around"). */
  justifyContent?: string;
  /** Cross-axis alignment ("start", "center", "end"). */
  alignItems?: string;
  /** Corner radius for rounded corners. */
  cornerRadius?: number;
  /** Clip overflow. */
  clip?: boolean;
  /** Mark as a slot for component instances. Array = recommended component IDs. */
  slot?: boolean | string[];
}

/**
 * Text element with typography controls.
 */
export interface UIText extends UIBaseElement {
  type: "text";
  /** The text content. */
  content?: unknown;
  /** Placeholder text when content is empty. */
  placeholder?: string;
  /** Font family. */
  fontFamily?: string;
  /** Font size. */
  fontSize?: number;
  /** Font weight. */
  fontWeight?: unknown;
  /** Text alignment ("left", "center", "right"). */
  textAlign?: string;
  /** Line height (multiplier of fontSize). */
  lineHeight?: number;
  /** Text decoration: "underline", "strikethrough". */
  textDecoration?: string;
}

/**
 * Rectangle shape element.
 */
export interface UIRectangle extends UIBaseElement {
  type: "rectangle";
  /** Corner radius. */
  cornerRadius?: number;
}

/**
 * Ellipse shape element.
 */
export interface UIEllipse extends UIBaseElement {
  type: "ellipse";
  /** Inner radius ratio (0=solid, 1=hollow ring). */
  innerRadius?: number;
}

/**
 * Path (SVG path) element.
 */
export interface UIPath extends UIBaseElement {
  type: "path";
  /** SVG path geometry string. */
  geometry?: string;
  /** Fill rule ("nonzero", "evenodd"). */
  fillRule?: "nonzero" | "evenodd";
}

/**
 * Instance of a reusable component — references another element by `id`.
 * Analogous to Pen's `ref` type.
 */
export interface UIRef extends UIBaseElement {
  type: "ref";
  /** ID of the referenced (reusable) element. */
  ref: string;
  /** Property overrides for descendant elements. */
  descendants?: Record<string, Record<string, unknown>>;
}

/**
 * Icon from an icon font library (e.g. Lucide, Material Symbols).
 */
export interface UIIconFont extends UIBaseElement {
  type: "icon_font";
  /** Icon name within the library. */
  icon?: string;
  /** Icon library (e.g. "lucide", "material_symbols"). */
  iconFontFamily?: string;
  /** Icon weight (for variable-weight fonts). */
  weight?: number;
}

// ---- Union Type for All Visual Nodes ----

export type UINode =
  | UIFrame
  | UIText
  | UIRectangle
  | UIEllipse
  | UIPath
  | UIRef
  | UIIconFont
  | UIBaseElement;

// ============================================================================
// Layer 3: Abstract Screens (simplified, semantic descriptions)
// ============================================================================

/** For simpler use cases, screens describe UI with semantic intent, not pixels. */
export interface UIScreen {
  /** Screen identifier. */
  id: string;
  /** Screen name. */
  name: string;
  /** Route (e.g. "/tasks", "/tasks/:id"). */
  route?: string;
  /** Purpose of this screen. */
  purpose?: string;
  /** Layout description. */
  layout?: string;
  /** Components on this screen. */
  components?: UIComponent[];
  /** Screen-level state. */
  state?: UIState;
  /** User interactions. */
  interactions?: UIInteraction[];
}

export interface UIComponent {
  name: string;
  /** Component type (e.g. "text", "button", "input", "list"). */
  type: string;
  /** Content or placeholder text. */
  content?: string;
  /** Placeholder text for inputs. */
  placeholder?: string;
  /** Props / data this component receives. */
  props?: string[];
  /** Style guidance (not CSS). */
  style?: string;
  /** Visual states (e.g. "normal", "completed", "overdue"). */
  states?: string[];
  /** Sub-components (for compound components). */
  children?: UIComponent[];
  /** Behaviors / event handlers. */
  behaviors?: string[];
  /** Events this component emits. */
  events?: string[];
  /** Data binding (e.g. "bind_to": "completed"). */
  bind_to?: string;
}

export interface UIState {
  /** Global state variables. */
  global?: string[];
  /** Local state variables. */
  local?: string[];
}

export interface UIInteraction {
  /** What triggers this interaction. */
  trigger: string;
  /** Action performed. */
  action: string;
  /** Description on success. */
  on_success?: string;
  /** Description on error. */
  on_error?: string;
}

// ============================================================================
// Navigation
// ============================================================================

/**
 * Application navigation structure — routes, screens, and transitions.
 */
export interface UINavigation {
  /** Type of navigation model ("hierarchical", "flat", "tab"). */
  type?: string;
  /** Navigation nodes forming the navigation tree. */
  nodes?: UINavNode[];
  /** Global navigation transitions. */
  transitions?: UINavTransition[];
}

export interface UINavNode {
  /** Node identifier. */
  id: string;
  /** Display label. */
  label?: string;
  /** Icon identifier. */
  icon?: string;
  /** Route path. */
  route?: string;
  /** Badge binding (e.g. "cart_item_count"). */
  badge?: string;
  /** Child navigation nodes. */
  children?: UINavNode[];
}

export interface UINavTransition {
  /** Source state. */
  from?: string;
  /** Target state. */
  to?: string;
  /** Transition animation. */
  animation?: string;
  /** Duration (e.g. "250ms"). */
  duration?: string;
}

// ============================================================================
// Responsive Design
// ============================================================================

export interface ResponsiveBreakpoint {
  /** Min width for this breakpoint. */
  min_width?: string;
  /** Max width for this breakpoint. */
  max_width?: string;
  /** Label (e.g. "mobile", "tablet", "desktop"). */
  label?: string;
  /** Description of layout adjustments. */
  description: string;
}

export interface UIComponentType {
  /** Component identifier. */
  component_id: string;
  /** Component type (e.g. "form", "list", "dashboard", "workflow"). */
  type?: string;
  /** Required data schema. */
  data_requirements?: string;
  /** Interaction rules for this component type. */
  interaction_rules?: string[];
}

// ============================================================================
// Test Contract
// ============================================================================

/**
 * The Test Contract is the verification mechanism: it defines the tests
 * that a reconstructed software implementation must pass to be considered
 * functionally equivalent to the original.
 *
 * Tests are described as behavior specifications — given/when/then —
 * without implementation code.
 */
export interface TestContract {
  /** Unit tests organized by module/function. */
  unit_tests?: UnitTestGroup[];
  /** Integration tests that span multiple components. */
  integration_tests?: IntegrationTest[];
  /** Acceptance criteria for the entire system. */
  acceptance_criteria?: string[];
}

export interface UnitTestGroup {
  /** The module this group tests. */
  module_id?: string;
  /** The interface/function this group tests. */
  interface_id?: string;
  /** Individual test cases. */
  test_cases?: UnitTestCase[];
}

export interface UnitTestCase {
  /** Unique test ID. */
  id: string;
  /** What this test verifies. */
  description: string;
  /** Preconditions / setup. */
  given?: unknown;
  /** The action being tested. */
  when?: string;
  /** Expected results. */
  then?: unknown;
  /** Expected exception. */
  expected_exception?: string;
  /** Expected side effects. */
  expected_side_effects?: string[];
}

export interface IntegrationTest {
  /** Unique test ID. */
  id: string;
  /** What this test verifies. */
  description: string;
  /** Step-by-step scenario. */
  steps?: string[];
  /** Expected result. */
  expected_result?: string;
  /** Assertions. */
  assertions?: string[];
}

// ============================================================================
// Reconstruction Rules
// ============================================================================

/**
 * Reconstruction Rules guide the builder agent in how to reconstruct
 * the software from the S.DEF description.
 *
 * This includes the target fidelity level, technology stack constraints,
 * and priority-ordered directives.
 */
export interface ReconstructionRules {
  /**
   * Target reconstruction fidelity:
   * - "prototype": Functional demo, fidelity not guaranteed
   * - "production_equivalent": Functionally equivalent, similar quality
   * - "bit_identical": Byte-for-byte identical output
   */
  reconstruction_fidelity?:
    | "prototype"
    | "production_equivalent"
    | "bit_identical";
  /**
   * Compatibility mode for code generation:
   * - "full": Keep all compatibility layers (behavior identical to original)
   * - "mixed": Keep compat layers but mark as deprecated
   * - "clean": Strip all deprecated/compat elements, generate only current versions
   * - "custom": Use `target_versions` for fine-grained control
   */
  compatibility_mode?: "full" | "mixed" | "clean" | "custom";
  /** When compatibility_mode is "custom", which versions to include compat for. */
  target_versions?: string[];
  /** Technology stack constraints. */
  tech_constraints?: TechConstraints;
  /** Directives that guide the reconstruction process. */
  directives?: ReconstructionDirective[];
}

export interface TechConstraints {
  /** Target language family (e.g. "jvm", "javascript", "python", "dotnet"). */
  language_family?: string;
  /** Target runtime (e.g. "browser", "node", "jvm"). */
  runtime?: string;
  /** Data persistence model (e.g. "relational", "document", "graph", "key_value"). */
  persistence_model?: string;
  /** Network protocol (e.g. "http", "grpc", "websocket"). */
  protocol?: string;
  /** Concurrency model (e.g. "threaded", "async", "actor"). */
  concurrency_model?: string;
  /** Allowed open-source licenses. */
  allowed_licenses?: string[];
  /** Preferred frameworks (optional suggestions). */
  preferred_frameworks?: string[];
  /** Environment variables. */
  env_variables?: EnvironmentVariable[];
}

export interface ReconstructionDirective {
  /** Priority level: must, should, or may. */
  priority: "must" | "should" | "may";
  /** The directive content. */
  directive: string;
  /** Why this directive exists. */
  rationale?: string;
  /** When true, this directive acts as a read-only lock — agents must not modify the targeted code without explicit approval. */
  locked?: boolean;
}

export interface EnvironmentVariable {
  name: string;
  description: string;
  /** Indicates this value is a secret. */
  secret?: boolean;
}

// ============================================================================
// Deployment
// ============================================================================

export interface Deployment {
  /** Runtime requirements. */
  runtime?: RuntimeRequirement;
  /** Build output description. */
  build_output?: string;
  /** Deployment steps. */
  deployment_steps?: string[];
  /** Configuration variables. */
  configuration?: ConfigurationVar[];
  /** Scaling strategy. */
  scaling?: ScalingStrategy;
  /** Monitoring requirements. */
  monitoring?: string;
}

export interface RuntimeRequirement {
  /** Runtime environment (e.g. "modern web browser", "Node.js 22"). */
  environment?: string;
  /** Minimum versions. */
  minimum_versions?: Record<string, string>;
}

export interface ConfigurationVar {
  name: string;
  description?: string;
  /** Default value. */
  default_value?: string;
}

export interface ScalingStrategy {
  /** Strategy description (e.g. "horizontal, stateless"). */
  description?: string;
}

// ============================================================================
// Dependencies & Resources
// ============================================================================

export interface Dependency {
  /** Name of the dependency. */
  name: string;
  /** Version constraint. */
  version?: string;
  /** Type of dependency (e.g., runtime, build, dev). */
  type?: "runtime" | "build" | "dev" | "optional";
  /** Purpose of this dependency. */
  purpose?: string;
  /** Where to obtain the dependency. */
  source?: string;
}

export interface Resource {
  /** Resource name. */
  name: string;
  /** Resource type (e.g., database, file, endpoint). */
  type: string;
  /** URI identifying the resource. */
  uri?: string;
  /** Description. */
  description?: string;
}

// ============================================================================
// Reconstruction Policy (PTDL — Paradigm Translation & Decoupling Layer)
// ============================================================================

/**
 * Per-document cross-language/paradigm reconstruction policy.
 *
 * This block tells the consumer agent how to handle S.DEF elements that
 * originate from a different language or paradigm. It is orthogonal to
 * `reconstruction_rules`, which handles the time dimension (v1 vs v2).
 *
 * # When to use
 *
 * Whenever the source software is written in a different language or
 * paradigm than the target. For same-language refactoring, this block
 * can be omitted entirely.
 *
 * # Four-tier classification
 *
 * Each S.DEF element carries an `origin.reconstruction_class` tag:
 *
 * | Tier | Class               | Consumer action |
 * |------|---------------------|-----------------|
 * | A    | `behavior_contract` | Preserve 1:1 (signatures, semantics, error cases) |
 * | B    | `algorithm`         | Keep algorithm body, swap data structures |
 * | C    | `idiom`             | Translate to target-language idioms |
 * | D    | `incidental`        | Omit — let the target language fill the gap |
 *
 * @see docs/19-reconstruction-quality.md for the full design
 * @see proposals/0000-ptdl-reconstruction-policy.md for the proposal
 * @example ./examples/ReconstructionPolicy/reconstruction-policy.json ReconstructionPolicy
 */
export interface ReconstructionPolicy {
  /**
   * Default strategy for Tier C elements when no per-element override exists.
   * - `translate`: rewrite using target-language idioms (default)
   * - `preserve`: keep the source-language structure as-is
   * - `omit`: drop entirely
   */
  default_tier_c_strategy?: "translate" | "preserve" | "omit";
  /**
   * Default strategy for Tier D elements when no per-element override exists.
   * - `omit`: drop entirely (default)
   * - `translate`: still attempt a translation
   * - `preserve`: keep the source-language structure as-is
   */
  default_tier_d_strategy?: "translate" | "preserve" | "omit";

  /** Source-language paradigm fingerprint. Producer-inferred, may be human-overridden. */
  source_paradigm?: ParadigmMetadata;
  /** Target-language paradigm fingerprint. Consumer-provided or auto-detected. */
  target_paradigm?: ParadigmMetadata;

  /** Library substitution suggestions — Producer-inferred from dependency analysis. */
  library_substitutions?: LibrarySubstitution[];

  /**
   * Paradigm translation rules. May be document-specific or referenced from a
   * global pool keyed by paradigm pair (e.g. `c_to_rust`, `ocaml_to_java`).
   */
  transformation_hints?: TransformationHint[];

  /**
   * Whether the consumer agent may introduce dependencies that the original
   * software did not use. Required for Tier D → library substitution flows.
   * Default: `true`.
   */
  allow_extra_dependencies?: boolean;

  /**
   * Whether the consumer agent may alter externally observable behavior.
   * Default: `false` — behavior must be 1:1.
   *
   * Set to `true` only when the user explicitly accepts that the rebuild
   * is a "reinterpretation" rather than a faithful replication.
   */
  allow_behavior_drift?: boolean;
}

/**
 * Language paradigm fingerprint — describes how a language "thinks."
 *
 * This is the machine-readable version of "C is manual-memory, single-threaded,
 * error-code-driven; Rust is ownership-based, thread-or-async, Result-driven."
 *
 * @example ./examples/ParadigmMetadata/paradigm-c.json ParadigmMetadata
 * @example ./examples/ParadigmMetadata/paradigm-rust.json ParadigmMetadata
 * @example ./examples/ParadigmMetadata/paradigm-ocaml.json ParadigmMetadata
 */
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
  /** Optional secondary paradigm (e.g. Kotlin: oop + functional). */
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
  /**
   * How unsafe operations (raw pointers, unions, FFI) are expressed.
   * `none` means the language does not expose unsafe operations at all.
   */
  unsafe_constructs?: "explicit_unsafe" | "implicit_everywhere" | "none";
}

/**
 * Per-element reconstruction provenance — the four-tier classification.
 *
 * The Producer attaches this to every entity it extracts. The Consumer
 * reads it to decide what to generate, replace, or omit.
 *
 * # Decision matrix
 *
 * | Tier | Source impl. contains | Consumer action |
 * |------|----------------------|-----------------|
 * | A    | Public API / wire format | Preserve 1:1 |
 * | B    | Algorithm body | Keep algorithm, swap data structures |
 * | C    | Source-language idiom | Translate to target-language idiom |
 * | D    | Source-language workaround | Omit (target language fills the gap) |
 *
 * # Confidence
 *
 * `confidence` is a 0.0–1.0 score from the Producer's classifier. Consumer
 * agents should treat `confidence < 0.6` as "advisory only" and double-check
 * before applying Tier D (omit) — silently dropping a public API would
 * break behavioral equivalence.
 *
 * @example ./examples/ElementOrigin/origin-tier-d.json ElementOrigin
 * @example ./examples/ElementOrigin/origin-tier-a.json ElementOrigin
 */
export interface ElementOrigin {
  /**
   * Tier classification. See the decision matrix above.
   */
  reconstruction_class:
    | "behavior_contract"
    | "algorithm"
    | "idiom"
    | "incidental";
  /**
   * Producer-inferred confidence in the 0–100 range (integer).
   * `100` = certain; `>= 60` = reliable; `< 60` = advisory only.
   *
   * Consumer agents should treat `confidence < 60` as "advisory only"
   * and double-check before applying Tier D (omit) — silently dropping
   * a public API would break behavioral equivalence.
   */
  confidence: number;
  /** Evidence used to make the classification. Audit-friendly free-form strings. */
  evidence: string[];
  /** Human-readable rationale. */
  rationale: string;
  /**
   * Optional per-element override of the document-level
   * `ReconstructionPolicy.default_tier_*_strategy` setting.
   */
  override_strategy?: "translate" | "preserve" | "omit";
}

/**
 * Suggestion to replace an original implementation with a library in the
 * target ecosystem.
 *
 * The Producer emits one of these for each original-software function
 * that re-implements something a standard library does (SHA-1, CRC,
 * hash tables, custom allocators, etc.). The Consumer selects the
 * highest-trust candidate matching the target ecosystem.
 *
 * @example ./examples/LibrarySubstitution/substitution-sha1.json LibrarySubstitution
 */
export interface LibrarySubstitution {
  /** Unique ID (also used in the symbol registry). */
  id: string;
  /**
   * Signature of the function being replaced, in target-language notation.
   * Example: `"fn sha1(bytes: &[u8]) -> [u8; 20]"`.
   */
  function_signature: string;
  /** What the original software actually used. */
  original_implementation: {
    /** Display name (e.g. `"SHA1"`, `"zmalloc"`, `"sds"`). */
    name: string;
    /** Source file (e.g. `"src/sha1.c"`). */
    source_file?: string;
    /** Lines of code in the original implementation. */
    lines_of_code?: number;
    /** SPDX license identifier of the original (e.g. `"BSD-3-Clause"`). */
    license?: string;
  };
  /** Ranked candidates. Consumer picks the highest-trust one matching the target ecosystem. */
  candidates: LibraryCandidate[];
  /**
   * Optional selection rule (DSL string). Default behavior: pick the
   * candidate with the highest `trust` in the target ecosystem.
   *
   * Example: `"target.language == 'rust' ? first : omit"`
   */
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
  /**
   * Package / crate / module name. For `ecosystem = "std"`, this is the
   * full path (e.g. `"std::collections::HashMap"`).
   */
  name: string;
  /**
   * Version constraint (e.g. `">=0.17"`, `"1.0"`, `"*"`).
   * Omit for unversioned dependencies.
   */
  version?: string;
  /** Why this candidate is recommended. */
  rationale: string;
  /**
   * Known risks (e.g. `"uses nightly-only feature"`,
   * `"has unmaintained dependencies"`).
   */
  risks?: string[];
  /**
   * Trust score in the 0–100 range (integer). Higher = stronger preference.
   * `100` = production-grade; `>= 60` = reliable; `< 60` = use with caution.
   */
  trust: number;
}

/**
 * A source-pattern → target-pattern translation rule.
 *
 * Transformation hints are keyed by paradigm pair (e.g. `c → rust`,
 * `ocaml → java`). They can be document-specific or referenced from a
 * global pool via `sdef://hints/{source}_to_{target}/{slug}` URIs.
 *
 * # Source / target patterns
 *
 * The pattern strings are matched against S.DEF element characteristics.
 * They are intentionally free-form (DSL) to allow future evolution
 * without a schema change. Common forms include:
 *
 * - `"function with pattern matching over ADT with >3 variants"`
 * - `"function returning int error code (-1)"`
 * - `"function with manual malloc/free pair"`
 * - `"data model with manual refcount attribute"`
 *
 * @example ./examples/TransformationHint/hint-c-error-code-to-rust-result.json TransformationHint
 */
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
