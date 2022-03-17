/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { appendFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IAspect, Annotations, CfnResource, App, Names } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPackSuppression } from './models/nag-suppression';
import { NagRuleCompliance, NagRuleResult, NagRuleFindings } from './nag-rules';
import { NagSuppressionHelper } from './utils/nag-suppression-helper';

const VALIDATION_FAILURE_ID = 'CdkNagValidationFailure';
const SUPPRESSION_ID = 'CdkNagSuppression';

/**
 * Interface for creating a Nag rule pack.
 */
export interface NagPackProps {
  /**
   * Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).
   */
  readonly verbose?: boolean;

  /**
   * Whether or not to log triggered rules that have been suppressed as informational messages (default: false).
   */
  readonly logIgnores?: boolean;

  /**
   * Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true).
   */
  readonly reports?: boolean;
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
   * Ignores listed in cdk-nag metadata.
   */
  node: CfnResource;
  /**
   * The callback to the rule.
   * @param node The CfnResource to check.
   */
  rule(node: CfnResource): NagRuleResult;
}

/**
 * The level of the message that the rule applies.
 */
export enum NagMessageLevel {
  WARN = 'Warning',
  ERROR = 'Error',
}

/**
 * Base class for all rule packs.
 */
export abstract class NagPack implements IAspect {
  protected verbose: boolean;
  protected logIgnores: boolean;
  protected reports: boolean;
  protected reportStacks = new Array<string>();
  protected packName = '';

  constructor(props?: NagPackProps) {
    this.verbose =
      props == undefined || props.verbose == undefined ? false : props.verbose;
    this.logIgnores =
      props == undefined || props.logIgnores == undefined
        ? false
        : props.logIgnores;
    this.reports =
      props == undefined || props.reports == undefined ? true : props.reports;
  }

  public get readPackName(): string {
    return this.packName;
  }
  public get readReportStacks(): string[] {
    return this.reportStacks;
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
    const allIgnores = NagSuppressionHelper.getSuppressions(params.node);
    const ruleSuffix = params.ruleSuffixOverride
      ? params.ruleSuffixOverride
      : params.rule.name;
    const ruleId = `${this.packName}-${ruleSuffix}`;
    try {
      const ruleCompliance = params.rule(params.node);
      if (this.reports === true) {
        this.initializeStackReport(params);
        if (ruleCompliance === NagRuleCompliance.COMPLIANT) {
          this.writeToStackComplianceReport(params, ruleId, ruleCompliance);
        }
      }
      if (this.isNonCompliant(ruleCompliance)) {
        const findings = this.asFindings(ruleCompliance);
        for (const findingId of findings) {
          const suppressionReason = this.ignoreRule(
            allIgnores,
            ruleId,
            findingId
          );

          if (this.reports === true) {
            this.writeToStackComplianceReport(
              params,
              ruleId,
              NagRuleCompliance.NON_COMPLIANT,
              suppressionReason
            );
          }

          if (suppressionReason) {
            if (this.logIgnores === true) {
              const message = this.createMessage(
                SUPPRESSION_ID,
                findingId,
                `${ruleId} was triggered but suppressed.`,
                `Provided reason: "${suppressionReason}"`
              );
              Annotations.of(params.node).addInfo(message);
            }
          } else {
            const message = this.createMessage(
              ruleId,
              findingId,
              params.info,
              params.explanation
            );
            if (params.level == NagMessageLevel.ERROR) {
              Annotations.of(params.node).addError(message);
            } else if (params.level == NagMessageLevel.WARN) {
              Annotations.of(params.node).addWarning(message);
            }
          }
        }
      }
    } catch (error) {
      const reason = this.ignoreRule(allIgnores, VALIDATION_FAILURE_ID, '');
      if (this.reports === true) {
        this.writeToStackComplianceReport(params, ruleId, 'UNKNOWN', reason);
      }
      if (reason) {
        if (this.logIgnores === true) {
          const message = this.createMessage(
            SUPPRESSION_ID,
            '',
            `${VALIDATION_FAILURE_ID} was triggered but suppressed.`,
            reason
          );
          Annotations.of(params.node).addInfo(message);
        }
      } else {
        const information = `'${ruleId}' threw an error during validation. This is generally caused by a parameter referencing an intrinsic function. For more details enable verbose logging.'`;
        const message = this.createMessage(
          VALIDATION_FAILURE_ID,
          '',
          information,
          (error as Error).message
        );
        Annotations.of(params.node).addWarning(message);
      }
    }
  }

  /**
   * Check whether a specific rule should be ignored.
   * @param ignores The ignores listed in cdk-nag metadata.
   * @param ruleId The id of the rule to ignore.
   * @param findingId The id of the finding that is being checked.
   * @returns The reason the rule was ignored, or an empty string.
   */
  protected ignoreRule(
    ignores: NagPackSuppression[],
    ruleId: string,
    findingId: string
  ): string {
    for (let ignore of ignores) {
      if (NagSuppressionHelper.doesApply(ignore, ruleId, findingId)) {
        if (!ignore.appliesTo) {
          // the rule is not granular so it always applies
          return ignore.reason;
        } else {
          return `[${findingId}] ${ignore.reason}`;
        }
      }
    }
    return '';
  }

  /**
   * The message to output to the console when a rule is triggered.
   * @param ruleId The id of the rule.
   * @param findingId The id of the finding.
   * @param info Why the rule was triggered.
   * @param explanation Why the rule exists.
   * @returns The formatted message string.
   */
  protected createMessage(
    ruleId: string,
    findingId: string,
    info: string,
    explanation: string
  ): string {
    let message = findingId
      ? `${ruleId}[${findingId}]: ${info}`
      : `${ruleId}: ${info}`;
    return this.verbose ? `${message} ${explanation}\n` : `${message}\n`;
  }

  /**
   * Write a line to the rule pack's compliance report for the resource's Stack
   * @param params The @IApplyRule interface with rule details.
   * @param ruleId The id of the rule.
   * @param compliance The compliance status of the rule.
   * @param explanation The explanation for suppressed rules.
   */
  protected writeToStackComplianceReport(
    params: IApplyRule,
    ruleId: string,
    compliance:
      | NagRuleCompliance.COMPLIANT
      | NagRuleCompliance.NON_COMPLIANT
      | 'UNKNOWN',
    explanation: string = ''
  ): void {
    const line = this.createComplianceReportLine(
      params,
      ruleId,
      compliance,
      explanation
    );
    const outDir = App.of(params.node)?.outdir;
    const stackName = params.node.stack.nested
      ? Names.uniqueId(params.node.stack)
      : params.node.stack.stackName;
    const fileName = `${this.packName}-${stackName}-NagReport.csv`;
    const filePath = join(outDir ? outDir : '', fileName);
    appendFileSync(filePath, line);
  }

  /**
   * Initialize the report for the rule pack's compliance report for the resource's Stack if it doesn't exist
   * @param params
   */
  protected initializeStackReport(params: IApplyRule): void {
    const stackName = params.node.stack.nested
      ? Names.uniqueId(params.node.stack)
      : params.node.stack.stackName;
    const fileName = `${this.packName}-${stackName}-NagReport.csv`;
    if (!this.reportStacks.includes(fileName)) {
      const outDir = App.of(params.node)?.outdir;
      const filePath = join(outDir ? outDir : '', fileName);
      this.reportStacks.push(fileName);
      writeFileSync(
        filePath,
        'Rule ID,Resource ID,Compliance,Exception Reason,Rule Level,Rule Info\n'
      );
    }
  }

  /**
   * Helper function to create a line for the compliance report
   * @param params The @IApplyRule interface with rule details.
   * @param ruleId The id of the rule.
   * @param compliance The compliance status of the rule.
   * @param explanation The explanation for suppressed rules.
   */
  protected createComplianceReportLine(
    params: IApplyRule,
    ruleId: string,
    compliance:
      | NagRuleCompliance.COMPLIANT
      | NagRuleCompliance.NON_COMPLIANT
      | 'UNKNOWN',
    explanation: string = ''
  ): string {
    //| Rule ID | Resource ID | Compliance | Exception Reason | Rule Level | Rule Info
    const line = Array<string>();
    line.push(ruleId);
    line.push(params.node.node.path);
    if (
      (compliance === NagRuleCompliance.NON_COMPLIANT ||
        compliance === 'UNKNOWN') &&
      explanation !== ''
    ) {
      line.push('Suppressed');
      line.push(explanation);
    } else {
      line.push(compliance);
      line.push('N/A');
    }
    line.push(params.level);
    line.push(params.info);
    return line.map((i) => '"' + i.replace(/"/g, '""') + '"').join(',') + '\n';
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
