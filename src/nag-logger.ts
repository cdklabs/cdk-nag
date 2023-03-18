/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { appendFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Annotations, App, CfnResource, Names } from 'aws-cdk-lib';
import { NagMessageLevel, VALIDATION_FAILURE_ID } from './nag-pack';
import { NagRuleCompliance } from './nag-rules';

/**
 * Shared input for all INagLogger methods
 * @param nagPackName The name of the NagPack that the rule belongs to.
 * @param resource The resource the suppression is applied to.
 * @param ruleId Why the rule was triggered.
 * @param ruleInfo The id of the rule to ignore.
 * @param ruleExplanation Why the rule exists.
 * @param ruleLevel The severity level of the rule.
 * @param verbose Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages.
 */
export interface NagLoggerInputBase {
  readonly nagPackName: string;
  readonly resource: CfnResource;
  readonly ruleId: string;
  readonly ruleInfo: string;
  readonly ruleExplanation: string;
  readonly ruleLevel: NagMessageLevel;
  readonly verbose: boolean;
}

/**
 * Input for onCompliance method of an INagLogger
 */
export interface NagLoggerComplianceInput extends NagLoggerInputBase {}
/**
 * Input for onNonCompliance method of an INagLogger
 * @param findingId The id of the finding that is being checked.
 */
export interface NagLoggerNonComplianceInput extends NagLoggerInputBase {
  readonly findingId: string;
}
/**
 * Input for onSuppression method of an INagLogger
 * @param suppressionReason The reason given for the suppression.
 * @param shouldLogIgnored Whether or not the NagPack user has indicated that they want to log suppression details
 */
export interface NagLoggerSuppressionInput extends NagLoggerNonComplianceInput {
  readonly suppressionReason: string;
  readonly shouldLogIgnored: boolean;
}
/**
 * Input for onError method of an INagLogger
 * @param errorMessage: The error that was thrown
 * @param shouldLogIgnored Whether or not the NagPack user has indicated that they want to log suppression details
 */
export interface NagLoggerErrorInput extends NagLoggerInputBase {
  readonly errorMessage: string;
}
/**
 * Input for onSuppressedError method of an INagLogger
 * @param errorSuppressionReason The reason given for the validation error suppression.
 */
export interface NagLoggerSuppressedErrorInput extends NagLoggerErrorInput {
  readonly errorSuppressionReason: string;
  readonly shouldLogIgnored: boolean;
}

/**
 * Input for onNotApplicable method of an INagLogger
 */
export interface NagLoggerNotApplicableInput extends NagLoggerInputBase {}

/**
 * States a rule can be in post validation
 */
export enum NagRulePostValidationStates {
  SUPPRESSED = 'Suppressed',
  UNKNOWN = 'UNKNOWN',
}
export type NagLoggerCompliance =
  | NagRuleCompliance
  | NagRulePostValidationStates;

/**
 * Interface for creating NagSuppression Ignores
 */
export interface INagLogger {
  /**
   * Called when a CfnResource passes the compliance check for a given rule.
   */
  onCompliance(input: NagLoggerComplianceInput): void;
  /**
   * Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.
   */
  onNonCompliance(input: NagLoggerNonComplianceInput): void;
  /**
   * Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.
   */
  onSuppression(input: NagLoggerSuppressionInput): void;
  /**
   * Called when a rule throws an error during while validating a CfnResource for compliance.
   */
  onError(input: NagLoggerErrorInput): void;
  /**
   * Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.
   */
  onSuppressedError(input: NagLoggerSuppressedErrorInput): void;
  /**
   * Called when a rule does not apply to the given CfnResource.
   */
  onNotApplicable(input: NagLoggerNotApplicableInput): void;
}

/**
 * A NagLogger that outputs to the CDK Annotations system
 */
export class AnnotationsLogger implements INagLogger {
  suppressionId = 'CdkNagSuppression';
  onCompliance(_input: NagLoggerComplianceInput): void {
    return;
  }
  onNonCompliance(input: NagLoggerNonComplianceInput): void {
    const message = this.createMessage(
      input.ruleId,
      input.findingId,
      input.ruleInfo,
      input.ruleExplanation,
      input.verbose
    );
    if (input.ruleLevel == NagMessageLevel.ERROR) {
      Annotations.of(input.resource).addError(message);
    } else if (input.ruleLevel == NagMessageLevel.WARN) {
      Annotations.of(input.resource).addWarning(message);
    }
  }
  onSuppression(input: NagLoggerSuppressionInput): void {
    if (input.shouldLogIgnored) {
      const message = this.createMessage(
        this.suppressionId,
        input.findingId,
        `${input.ruleId} was triggered but suppressed.`,
        `Provided reason: "${input.suppressionReason}"`,
        input.verbose
      );
      Annotations.of(input.resource).addInfo(message);
    }
  }
  onError(input: NagLoggerErrorInput): void {
    const information = `'${input.ruleId}' threw an error during validation. This is generally caused by a parameter referencing an intrinsic function. You can suppress the "${VALIDATION_FAILURE_ID}" to get rid of this error. For more details enable verbose logging.'`;
    const message = this.createMessage(
      VALIDATION_FAILURE_ID,
      '',
      information,
      input.errorMessage,
      input.verbose
    );
    Annotations.of(input.resource).addWarning(message);
  }
  onSuppressedError(input: NagLoggerSuppressedErrorInput): void {
    if (input.shouldLogIgnored === true) {
      const message = this.createMessage(
        this.suppressionId,
        '',
        `${VALIDATION_FAILURE_ID} was triggered but suppressed.`,
        input.errorSuppressionReason,
        input.verbose
      );
      Annotations.of(input.resource).addInfo(message);
    }
  }
  onNotApplicable(_input: NagLoggerNotApplicableInput): void {
    return;
  }

  protected createMessage(
    ruleId: string,
    findingId: string,
    ruleInfo: string,
    ruleExplanation: string,
    verbose: boolean
  ): string {
    let message = findingId
      ? `${ruleId}[${findingId}]: ${ruleInfo}`
      : `${ruleId}: ${ruleInfo}`;
    return verbose ? `${message} ${ruleExplanation}\n` : `${message}\n`;
  }
}

/**
 * A NagLogger that creates CSV compliance reports
 */
export class CsvReportLogger implements INagLogger {
  readonly reportStacks = new Array<string>();

  onCompliance(input: NagLoggerComplianceInput): void {
    this.initializeStackReport(input);
    this.writeToStackComplianceReport(input, NagRuleCompliance.COMPLIANT);
  }
  onNonCompliance(input: NagLoggerNonComplianceInput): void {
    this.initializeStackReport(input);
    this.writeToStackComplianceReport(input, NagRuleCompliance.NON_COMPLIANT);
  }
  onSuppression(input: NagLoggerSuppressionInput): void {
    this.initializeStackReport(input);
    this.writeToStackComplianceReport(
      input,
      NagRulePostValidationStates.SUPPRESSED
    );
  }
  onError(input: NagLoggerErrorInput): void {
    this.initializeStackReport(input);
    this.writeToStackComplianceReport(
      input,
      NagRulePostValidationStates.UNKNOWN
    );
  }
  onSuppressedError(input: NagLoggerSuppressedErrorInput): void {
    this.initializeStackReport(input);
    this.writeToStackComplianceReport(
      input,
      NagRulePostValidationStates.SUPPRESSED
    );
  }
  onNotApplicable(input: NagLoggerNotApplicableInput): void {
    this.initializeStackReport(input);
  }

  /**
   * Initialize the report for the rule pack's compliance report for the resource's Stack if it doesn't exist
   * @param input
   */
  protected initializeStackReport(input: NagLoggerInputBase): void {
    const stackName = input.resource.stack.nested
      ? Names.uniqueId(input.resource.stack)
      : input.resource.stack.stackName;
    const fileName = `${input.nagPackName}-${stackName}-NagReport.csv`;
    if (!this.reportStacks.includes(fileName)) {
      const filePath = join(App.of(input.resource)?.outdir ?? '', fileName);
      this.reportStacks.push(fileName);
      writeFileSync(
        filePath,
        'Rule ID,Resource ID,Compliance,Exception Reason,Rule Level,Rule Info\n'
      );
    }
  }

  protected writeToStackComplianceReport(
    input: NagLoggerInputBase,
    compliance: NagLoggerCompliance
  ): void {
    const stackName = input.resource.stack.nested
      ? Names.uniqueId(input.resource.stack)
      : input.resource.stack.stackName;
    const fileName = `${input.nagPackName}-${stackName}-NagReport.csv`;
    const filePath = join(App.of(input.resource)?.outdir ?? '', fileName);
    appendFileSync(filePath, createComplianceReportLine());

    function createComplianceReportLine(): string {
      //| Rule ID | Resource ID | Compliance | Exception Reason | Rule Level | Rule Info
      const line = Array<string>();
      line.push(input.ruleId);
      line.push(input.resource.node.path);
      if (compliance === NagRulePostValidationStates.SUPPRESSED) {
        line.push('Suppressed');
        if (
          (input as NagLoggerSuppressionInput).suppressionReason !== undefined
        ) {
          line.push((input as NagLoggerSuppressionInput).suppressionReason);
        } else {
          line.push(
            (input as NagLoggerSuppressedErrorInput).errorSuppressionReason
          );
        }
      } else {
        line.push(compliance);
        line.push('N/A');
      }
      line.push(input.ruleLevel);
      line.push(input.ruleInfo);
      return (
        line.map((i) => '"' + i.replace(/"/g, '""') + '"').join(',') + '\n'
      );
    }
  }
}
