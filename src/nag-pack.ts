/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Annotations, CfnResource, IAspect } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import {
  INagSuppressionIgnore,
  SuppressionIgnoreNever,
  SuppressionIgnoreOr,
} from './ignore-suppression-conditions';
import { NagPackSuppression } from './models/nag-suppression';
import {
  AnnotationLogger,
  NagReportLogger,
  INagLogger,
  NagLoggerInputBase,
  NagReportFormat,
} from './nag-logger';
import { NagRuleCompliance, NagRuleFindings, NagRuleResult } from './nag-rules';
import { NagSuppressionHelper } from './utils/nag-suppression-helper';

export const VALIDATION_FAILURE_ID = 'CdkNagValidationFailure';

/**
 * Interface for creating a NagPack.
 */
export interface NagPackProps {
  /**
   * Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).
   */
  readonly verbose?: boolean;

  /**
   * Whether or not to log suppressed rule violations as informational messages (default: false).
   */
  readonly logIgnores?: boolean;

  /**
   * Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true).
   */
  readonly reports?: boolean;

  /**
   * If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV).
   */
  readonly reportFormats?: NagReportFormat[];

  /**
   * Conditionally prevent rules from being suppressed (default: no user provided condition).
   */
  readonly suppressionIgnoreCondition?: INagSuppressionIgnore;

  /**
   * Additional NagLoggers for logging rule validation outputs.
   */
  readonly additionalNagLoggers?: INagLogger[];
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
   * A condition in which a suppression should be ignored.
   */
  ignoreSuppressionCondition?: INagSuppressionIgnore;
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
 * The severity level of the rule.
 */
export enum NagMessageLevel {
  WARN = 'Warning',
  ERROR = 'Error',
}

/**
 * Base class for all rule packs.
 */
export abstract class NagPack implements IAspect {
  protected loggingTargets = new Array<INagLogger>();
  protected packName = '';
  protected userGlobalSuppressionIgnore?: INagSuppressionIgnore;
  protected packGlobalSuppressionIgnore?: INagSuppressionIgnore;

  constructor(props?: NagPackProps) {
    this.userGlobalSuppressionIgnore = props?.suppressionIgnoreCondition;
    this.loggingTargets.push(
      new AnnotationLogger({
        verbose: props?.verbose,
        logIgnores: props?.logIgnores,
      })
    );
    if (props?.reports ?? true) {
      const formats = props?.reportFormats
        ? props.reportFormats
        : [NagReportFormat.CSV];
      this.loggingTargets.push(new NagReportLogger({ formats }));
    }
    if (props?.additionalNagLoggers) {
      this.loggingTargets.push(...props.additionalNagLoggers);
    }
  }

  public get readPackName(): string {
    return this.packName;
  }

  /**
   * All aspects can visit an IConstruct.
   */
  public abstract visit(node: IConstruct): void;

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
    const allSuppressions = NagSuppressionHelper.getSuppressions(params.node);
    const ruleSuffix = params.ruleSuffixOverride
      ? params.ruleSuffixOverride
      : params.rule.name;
    const ruleId = `${this.packName}-${ruleSuffix}`;
    const base: NagLoggerInputBase = {
      nagPackName: this.packName,
      resource: params.node,
      ruleId: ruleId,
      ruleInfo: params.info,
      ruleExplanation: params.explanation,
      ruleLevel: params.level,
    };
    try {
      const ruleCompliance = params.rule(params.node);
      if (ruleCompliance === NagRuleCompliance.COMPLIANT) {
        this.loggingTargets.forEach((t) => t.onCompliance(base));
      } else if (this.isNonCompliant(ruleCompliance)) {
        const findings = this.asFindings(ruleCompliance);
        for (const findingId of findings) {
          const suppressionReason = this.ignoreRule(
            allSuppressions,
            ruleId,
            findingId,
            params.node,
            params.level,
            params.ignoreSuppressionCondition
          );
          if (suppressionReason) {
            this.loggingTargets.forEach((t) =>
              t.onSuppression({
                ...base,
                suppressionReason,
                findingId,
              })
            );
          } else {
            this.loggingTargets.forEach((t) =>
              t.onNonCompliance({
                ...base,
                findingId,
              })
            );
          }
        }
      } else if (ruleCompliance === NagRuleCompliance.NOT_APPLICABLE) {
        this.loggingTargets.forEach((t) =>
          t.onNotApplicable({
            ...base,
          })
        );
      }
    } catch (error) {
      const reason = this.ignoreRule(
        allSuppressions,
        VALIDATION_FAILURE_ID,
        '',
        params.node,
        params.level,
        params.ignoreSuppressionCondition
      );
      if (reason) {
        this.loggingTargets.forEach((t) =>
          t.onSuppressedError({
            ...base,
            errorMessage: (error as Error).message,
            errorSuppressionReason: reason,
          })
        );
      } else {
        this.loggingTargets.forEach((t) =>
          t.onError({
            ...base,
            errorMessage: (error as Error).message,
          })
        );
      }
    }
  }

  /**
   * Check whether a specific rule should be ignored.
   * @param suppressions The suppressions listed in the cdk-nag metadata.
   * @param ruleId The id of the rule to ignore.
   * @param resource The resource being evaluated.
   * @param findingId The id of the finding that is being checked.
   * @returns The reason the rule was ignored, or an empty string.
   */
  protected ignoreRule(
    suppressions: NagPackSuppression[],
    ruleId: string,
    findingId: string,
    resource: CfnResource,
    level: NagMessageLevel,
    ignoreSuppressionCondition?: INagSuppressionIgnore
  ): string {
    for (let suppression of suppressions) {
      if (NagSuppressionHelper.doesApply(suppression, ruleId, findingId)) {
        const ignoreMessage = new SuppressionIgnoreOr(
          this.userGlobalSuppressionIgnore ?? new SuppressionIgnoreNever(),
          this.packGlobalSuppressionIgnore ?? new SuppressionIgnoreNever(),
          ignoreSuppressionCondition ?? new SuppressionIgnoreNever()
        ).createMessage({
          resource,
          reason: suppression.reason,
          ruleId,
          findingId,
          ruleLevel: level,
        });
        if (ignoreMessage) {
          let id = findingId ? `${ruleId}[${findingId}]` : `${ruleId}`;
          Annotations.of(resource).addInfo(
            `The suppression for ${id} was ignored for the following reason(s).\n\t${ignoreMessage}`
          );
        } else {
          if (!suppression.appliesTo) {
            // the rule is not granular so it always applies
            return suppression.reason;
          } else {
            return `[${findingId}] ${suppression.reason}`;
          }
        }
      }
    }
    return '';
  }

  private isNonCompliant(ruleResult: NagRuleResult) {
    return (
      ruleResult === NagRuleCompliance.NON_COMPLIANT ||
      Array.isArray(ruleResult)
    );
  }

  private asFindings(ruleResult: NagRuleResult): NagRuleFindings {
    if (Array.isArray(ruleResult)) {
      return ruleResult;
    } else {
      return [''];
    }
  }
}
