/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { appendFileSync, writeFileSync } from 'fs';
import {
  IAspect,
  IConstruct,
  Annotations,
  CfnResource,
  Stack,
} from '@aws-cdk/core';
import { NagPackSuppression } from './nag-suppressions';

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
   * Whether or not to generate CSV compliance reports for applied Stacks (default: false).
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
  rule(node: CfnResource): NagRuleCompliance;
}

/**
 * The level of the message that the rule applies.
 */
export enum NagMessageLevel {
  WARN = 'Warning',
  ERROR = 'Error',
}

/**
 * The compliance level of a resource in relation to a rule.
 */
export enum NagRuleCompliance {
  COMPLIANT = 'Compliant',
  NON_COMPLIANT = 'Non-Compliant',
  NOT_APPLICABLE = 'N/A',
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
      props == undefined || props.reports == undefined ? false : props.reports;
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
    let resourceIgnores = params.node.getMetadata('cdk_nag')?.rules_to_suppress;
    resourceIgnores = resourceIgnores ? resourceIgnores : [];
    let stackIgnores = Stack.of(params.node).templateOptions.metadata?.cdk_nag
      ?.rules_to_suppress;
    stackIgnores = stackIgnores ? stackIgnores : [];
    const allIgnores = resourceIgnores.concat(stackIgnores);
    const ruleSuffix = params.ruleSuffixOverride
      ? params.ruleSuffixOverride
      : params.rule.name;
    const ruleId = `${this.packName}-${ruleSuffix}`;
    try {
      const ruleCompliance = params.rule(params.node);
      if (
        this.reports === true &&
        ruleCompliance === NagRuleCompliance.COMPLIANT
      ) {
        this.writeToStackComplianceReport(params, ruleId, ruleCompliance);
      } else if (ruleCompliance === NagRuleCompliance.NON_COMPLIANT) {
        const reason = this.ignoreRule(allIgnores, ruleId);
        if (this.reports === true) {
          this.writeToStackComplianceReport(
            params,
            ruleId,
            ruleCompliance,
            reason
          );
        }
        if (reason) {
          if (this.logIgnores === true) {
            const message = this.createMessage(
              SUPPRESSION_ID,
              `${ruleId} was triggered but suppressed.`,
              `Provided reason: "${reason}"`
            );
            Annotations.of(params.node).addInfo(message);
          }
        } else {
          const message = this.createMessage(
            ruleId,
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
    } catch (error) {
      const reason = this.ignoreRule(allIgnores, VALIDATION_FAILURE_ID);
      if (this.reports === true) {
        this.writeToStackComplianceReport(params, ruleId, 'UNKNOWN', reason);
      }
      if (reason) {
        if (this.logIgnores === true) {
          const message = this.createMessage(
            SUPPRESSION_ID,
            `${VALIDATION_FAILURE_ID} was triggered but suppressed.`,
            reason
          );
          Annotations.of(params.node).addInfo(message);
        }
      } else {
        const information = `'${ruleId}' threw an error during validation. This is generally caused by a parameter referencing an intrinsic function. For more details enable verbose logging.'`;
        const message = this.createMessage(
          VALIDATION_FAILURE_ID,
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
   * @returns The reason the rule was ignored, or an empty string.
   */
  protected ignoreRule(ignores: NagPackSuppression[], ruleId: string): string {
    for (let ignore of ignores) {
      if (
        ignore.id &&
        ignore.reason &&
        JSON.stringify(ignore.reason).length >= 10
      ) {
        if (ignore.id == ruleId) {
          return ignore.reason;
        }
      } else {
        throw Error(
          `Improperly formatted cdk_nag rule suppression detected: ${JSON.stringify(
            ignore
          )}. See https://github.com/cdklabs/cdk-nag#suppressing-a-rule for information on suppressing a rule.`
        );
      }
    }
    return '';
  }

  /**
   * The message to output to the console when a rule is triggered.
   * @param ruleId The id of the rule.
   * @param info Why the rule was triggered.
   * @param explanation Why the rule exists.
   * @returns The formatted message string.
   */
  protected createMessage(
    ruleId: string,
    info: string,
    explanation: string
  ): string {
    let message = `${ruleId}: ${info}`;
    return this.verbose ? `${message} ${explanation}\n` : `${message}\n`;
  }

  /**
   * Write a line to the rule packs compliance report for the resource's Stack
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
    const fileName = `${this.packName}-${params.node.stack.stackName}-NagReport.csv`;
    if (!this.reportStacks.includes(fileName)) {
      this.reportStacks.push(fileName);
      writeFileSync(
        fileName,
        'Rule ID,Resource ID,Compliance,Exception Reason,Rule Level\n'
      );
    }
    appendFileSync(fileName, line);
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
    //| Rule ID | Resource ID | Compliance | Exception Reason | Rule Level
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
    return line.map((i) => '"' + i + '"').join(',') + '\n';
  }
}

/**
 * Use in cases where a primitive value must be known to pass a rule.
 * https://developer.mozilla.org/en-US/docs/Glossary/Primitive
 * @param node The CfnResource to check.
 * @param parameter The value to attempt to resolve.
 * @returns Return a value if resolves to a primitive data type, otherwise throw an error.
 */
export function resolveIfPrimitive(node: CfnResource, parameter: any): any {
  const resolvedValue = Stack.of(node).resolve(parameter);
  if (resolvedValue === Object(resolvedValue)) {
    throw Error(
      `The parameter resolved to to a non-primitive value "${JSON.stringify(
        resolvedValue
      )}", therefore the rule could not be validated.`
    );
  } else {
    return resolvedValue;
  }
}

/**
 * Use in cases where a token resolves to an intrinsic function and the referenced resource must be known to pass a rule.
 * @param node The CfnResource to check.
 * @param parameter The value to attempt to resolve.
 * @returns Return the Logical resource Id if resolves to a intrinsic function, otherwise the resolved provided value.
 */
export function resolveResourceFromInstrinsic(
  node: CfnResource,
  parameter: any
): any {
  const resolvedValue = Stack.of(node).resolve(parameter);
  const ref = resolvedValue?.Ref;
  const getAtt = resolvedValue?.['Fn::GetAtt'];
  if (ref != undefined) {
    return ref;
  } else if (Array.isArray(getAtt) && getAtt.length > 0) {
    return getAtt[0];
  }
  return resolvedValue;
}
