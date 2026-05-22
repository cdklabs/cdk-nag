/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource, IAspect } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import {
  AnnotationLogger,
  INagLogger,
  NagLoggerBaseData,
  NagReportFormat,
  NagReportLogger,
} from './nag-logger';
import {
  NagMessageLevel,
  NagRuleCompliance,
  NagRuleFindings,
  NagRuleResult,
} from './nag-rules';

/**
 * Interface for creating a NagPack.
 */
export interface NagPackProps {
  /**
   * Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).
   */
  readonly verbose?: boolean;

  /**
   * Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true).
   */
  readonly reports?: boolean;

  /**
   * If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV).
   */
  readonly reportFormats?: NagReportFormat[];

  /**
   * Additional NagLoggers for logging rule validation outputs.
   */
  readonly additionalLoggers?: INagLogger[];
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
 * Base class for all rule packs.
 */
export abstract class NagPack implements IAspect {
  protected loggers = new Array<INagLogger>();
  protected packName = '';

  constructor(props?: NagPackProps) {
    this.loggers.push(
      new AnnotationLogger({
        verbose: props?.verbose,
      })
    );
    if (props?.reports ?? true) {
      const formats = props?.reportFormats
        ? props.reportFormats
        : [NagReportFormat.CSV];
      this.loggers.push(new NagReportLogger({ formats }));
    }
    if (props?.additionalLoggers) {
      this.loggers.push(...props.additionalLoggers);
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
    const ruleSuffix = params.ruleSuffixOverride
      ? params.ruleSuffixOverride
      : params.rule.name;
    const ruleId = `${this.packName}-${ruleSuffix}`;
    const base: NagLoggerBaseData = {
      nagPackName: this.packName,
      resource: params.node,
      ruleId: ruleId,
      ruleOriginalName: params.rule.name,
      ruleInfo: params.info,
      ruleExplanation: params.explanation,
      ruleLevel: params.level,
    };
    try {
      const ruleCompliance = params.rule(params.node);
      if (ruleCompliance === NagRuleCompliance.COMPLIANT) {
        this.loggers.forEach((t) => t.onCompliance(base));
      } else if (this.isNonCompliant(ruleCompliance)) {
        const findings = this.asFindings(ruleCompliance);
        for (const findingId of findings) {
          this.loggers.forEach((t) =>
            t.onNonCompliance({
              ...base,
              findingId,
            })
          );
        }
      } else if (ruleCompliance === NagRuleCompliance.NOT_APPLICABLE) {
        this.loggers.forEach((t) =>
          t.onNotApplicable({
            ...base,
          })
        );
      }
    } catch (error) {
      this.loggers.forEach((t) =>
        t.onError({
          ...base,
          errorMessage: (error as Error).message,
        })
      );
    }
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
