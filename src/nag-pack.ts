/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  Aspects,
  CfnResource,
  IAspect,
  IPolicyValidationPlugin,
  IPolicyValidationContext,
  PolicyValidationPluginReport,
  PolicyViolation,
  PolicyViolatingResource,
  Validations,
} from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagRuleCompliance, NagRuleResult } from './nag-rules';

/**
 * Extended validation context that includes the construct tree.
 * Requires CDK core change to populate `appConstruct` during plugin validation.
 */
export interface INagValidationContext extends IPolicyValidationContext {
  readonly appConstruct: IConstruct;
}

/**
 * Interface for creating a NagPack.
 */
export interface NagPackProps {
  /**
   * Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).
   */
  readonly verbose?: boolean;

  /**
   * Whether to write acknowledged rules into CfnResource CloudFormation
   * Metadata as `cdk_nag: { rules_to_suppress: [...] }` for backwards
   * compatibility with v2 audit trail tooling (default: false).
   */
  readonly writeSuppressionsToCloudFormation?: boolean;
}

/**
 * Interface for JSII interoperability for passing parameters and the Rule Callback to @applyRule method.
 */
export interface IApplyRule {
  /**
   * Override for the suffix of the Rule ID for this rule
   */
  ruleSuffixOverride?: string;
  /**
   * Why the rule was triggered.
   */
  info: string;
  /**
   * Why the rule exists.
   */
  explanation: string;
  /**
   * The annotations message level to apply to the rule if triggered.
   */
  level: NagMessageLevel;
  /**
   * The CfnResource to check
   */
  node: CfnResource;
  /**
   * The callback to the rule.
   * @param node The CfnResource to check.
   */
  rule(node: CfnResource): NagRuleResult;
}

/**
 * Base class for all rule packs. Implements IPolicyValidationPlugin so that
 * packs are registered via `Validations.of(app).addPlugins(new MyPack(app))`
 * instead of `Aspects.of(app).add(...)`.
 */
export abstract class NagPack implements IPolicyValidationPlugin {
  public abstract readonly name: string;
  public readonly version?: string;
  public readonly ruleIds?: string[];
  protected packName = '';
  private violations: PolicyViolation[] = [];
  private verbose: boolean;

  constructor(scope?: IConstruct, props?: NagPackProps) {
    this.verbose = props?.verbose ?? false;
    if (scope && props?.writeSuppressionsToCloudFormation) {
      Aspects.of(scope).add(new WriteNagSuppressionsToCloudFormationAspect());
    }
  }

  public get readPackName(): string {
    return this.packName;
  }

  /**
   * Entry point called by the CDK validation framework.
   * Requires `appConstruct` to be present on the context (CDK core change).
   * For testing or direct invocation, use `validateScope(scope)`.
   */
  public validate(
    context: IPolicyValidationContext
  ): PolicyValidationPluginReport {
    const nagContext = context as INagValidationContext;
    if (!nagContext.appConstruct) {
      throw new Error(
        'NagPack requires a construct tree on the validation context. ' +
          'Use validateScope(scope) for direct invocation or ensure your CDK version provides appConstruct on IPolicyValidationContext.'
      );
    }
    return this.validateScope(nagContext.appConstruct);
  }

  /**
   * Validate a construct tree directly. This is the primary entry point
   * for testing and for CDK versions that do not yet provide `appConstruct` on
   * `IPolicyValidationContext`.
   */
  public validateScope(scope: IConstruct): PolicyValidationPluginReport {
    this.violations = [];
    this.walkTree(scope);
    return {
      success: this.violations.length === 0,
      violations: this.violations,
    };
  }

  /**
   * Recursively walk the construct tree and invoke checkResource on each CfnResource.
   */
  private walkTree(node: IConstruct): void {
    if (CfnResource.isCfnResource(node)) {
      this.checkResource(node);
    }
    for (const child of node.node.children) {
      this.walkTree(child);
    }
  }

  /**
   * Subclasses implement this to apply rules to each CfnResource.
   */
  protected abstract checkResource(node: CfnResource): void;

  /**
   * Create a rule to be used in the NagPack.
   * @param params The @IApplyRule interface with rule details.
   */
  protected applyRule(params: IApplyRule): void {
    if (this.packName === '') {
      throw Error(
        'The NagPack does not have a pack name, therefore the rule could not be applied. Set a packName in the NagPack constructor.'
      );
    }
    const ruleSuffix = params.ruleSuffixOverride
      ? params.ruleSuffixOverride
      : params.rule.name;
    const ruleId = `${this.packName}-${ruleSuffix}`;

    try {
      const result = params.rule(params.node);
      if (result === NagRuleCompliance.NON_COMPLIANT) {
        if (!this.isAcknowledged(params.node, ruleId)) {
          this.addViolation(ruleId, params);
        }
      } else if (Array.isArray(result)) {
        for (const finding of result) {
          const findingRuleId = `${ruleId}[${finding}]`;
          if (!this.isAcknowledged(params.node, findingRuleId)) {
            this.addViolation(findingRuleId, params);
          }
        }
      }
    } catch (error) {
      if (!this.isAcknowledged(params.node, ruleId)) {
        this.addViolation(ruleId, params, (error as Error).message);
      }
    }
  }

  /**
   * Add a violation to the internal violations array, grouping by ruleName.
   */
  private addViolation(
    ruleName: string,
    params: IApplyRule,
    errorMessage?: string
  ): void {
    const description = errorMessage
      ? `Rule threw an error during validation. ${
          this.verbose
            ? errorMessage
            : 'This is generally caused by a parameter referencing an intrinsic function.'
        }`
      : this.verbose
      ? `${params.info} ${params.explanation}`
      : params.info;

    const resource: PolicyViolatingResource = {
      constructPath: params.node.node.path,
      locations: ['Properties'],
    };

    const existing = this.violations.find((v) => v.ruleName === ruleName);
    if (existing) {
      existing.violatingResources.push(resource);
    } else {
      this.violations.push({
        ruleName,
        description,
        severity: params.level === NagMessageLevel.ERROR ? 'error' : 'warning',
        violatingResources: [resource],
      });
    }
  }

  /**
   * Check whether a specific rule has been acknowledged on the given resource
   * or any of its ancestor constructs via the CDK Validations
   * acknowledged-rules metadata mechanism.
   */
  private isAcknowledged(resource: CfnResource, ruleId: string): boolean {
    const metadataKey = Validations.ACKNOWLEDGED_RULES_METADATA_KEY;
    let current: IConstruct | undefined = resource;
    while (current) {
      for (const entry of current.node.metadata) {
        if (entry.type === metadataKey && entry.data) {
          const ids = Object.keys(entry.data as Record<string, string>).map(
            (k) => k.replace(/^annotation::/, '')
          );
          if (ids.includes(ruleId)) return true;
        }
      }
      current = current.node.scope;
    }
    return false;
  }
}

/**
 * An IAspect that reads acknowledged rules from construct metadata and writes
 * them into the CfnResource's CloudFormation Metadata for audit trail
 * persistence in the synthesized template. Preserves the v2 `cdk_nag`
 * metadata format.
 */
export class WriteNagSuppressionsToCloudFormationAspect implements IAspect {
  public visit(node: IConstruct): void {
    if (!CfnResource.isCfnResource(node)) return;
    const metadataKey = Validations.ACKNOWLEDGED_RULES_METADATA_KEY;
    const seen = new Set<string>();
    const rules: { id: string; reason: string }[] = [];

    let current: IConstruct | undefined = node;
    while (current) {
      for (const entry of current.node.metadata) {
        if (entry.type === metadataKey && entry.data) {
          for (const [qualifiedId, reason] of Object.entries(
            entry.data as Record<string, string>
          )) {
            const id = qualifiedId.replace(/^annotation::/, '');
            if (!seen.has(id)) {
              seen.add(id);
              rules.push({ id, reason });
            }
          }
        }
      }
      current = current.node.scope;
    }

    if (rules.length > 0) {
      node.addMetadata('cdk_nag', { rules_to_suppress: rules });
    }
  }
}
