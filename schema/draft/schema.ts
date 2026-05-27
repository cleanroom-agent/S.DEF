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
  /** Constraints (e.g. "max_length:200", "non_empty"). */
  constraints?: string[];
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
}

export interface InterfaceContract {
  name: string;
  /** Indicates this is abstract and must be implemented. */
  is_abstract?: boolean;
  description?: string;
  /** Methods defined on this interface. */
  methods?: ContractMethod[];
  /** Invariants that all implementations must maintain. */
  invariants?: string[];
}

export interface ClassContract {
  name: string;
  description?: string;
  /** Interfaces this class implements. */
  implements?: string[];
  /** Other contracts this class depends on. */
  dependencies?: string[];
  /** Methods defined on this class. */
  methods?: ContractMethod[];
}

export interface ContractMethod {
  /** Method signature (e.g. "create_task(input: CreateTaskInput) -> Task"). */
  signature: string;
  /** Behavioral description in natural language. */
  behavior?: string;
  /** Conditions that must be true before calling. */
  preconditions?: string[];
  /** Conditions guaranteed true after execution. */
  postconditions?: string[];
  /** Error cases. */
  errors?: string[];
}

export interface EnumContract {
  name: string;
  description?: string;
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
// Dependencies & Resources (enhanced from original)
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
// Legacy / Existing Interface Types (preserved for compatibility)
// ============================================================================

export interface SoftwareInterface {
  /** Unique name for this interface. */
  name: string;
  /** The type of interface (e.g., HTTP, gRPC, CLI, Library). */
  type: string;
  /** Description of what this interface provides. */
  description?: string;
  /** The specification for this interface. */
  spec?: InterfaceSpec;
}

export interface InterfaceSpec {
  /** Input parameters. */
  inputs?: Parameter[];
  /** Output results. */
  outputs?: Parameter[];
}

export interface Parameter {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  default?: unknown;
}
