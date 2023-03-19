/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { appendFileSync, readFileSync, writeFileSync } from 'fs';
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
 */
export interface NagLoggerInputBase {
  readonly nagPackName: string;
  readonly resource: CfnResource;
  readonly ruleId: string;
  readonly ruleInfo: string;
  readonly ruleExplanation: string;
  readonly ruleLevel: NagMessageLevel;
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
 */
export interface NagLoggerSuppressionInput extends NagLoggerNonComplianceInput {
  readonly suppressionReason: string;
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
 * Props for the AnnotationLogger
 */
export interface AnnotationLoggerProps {
  /**
   * Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages.
   */
  readonly verbose?: boolean;

  /**
   * Whether or not to log suppressed rule violations as informational messages (default: false).
   */
  readonly logIgnores?: boolean;
}
/**
 * A NagLogger that outputs to the CDK Annotations system
 */
export class AnnotationLogger implements INagLogger {
  suppressionId = 'CdkNagSuppression';
  readonly verbose: boolean;
  readonly logIgnores: boolean;
  constructor(props?: AnnotationLoggerProps) {
    this.verbose = props?.verbose ?? false;
    this.logIgnores = props?.logIgnores ?? false;
  }
  onCompliance(_input: NagLoggerComplianceInput): void {
    return;
  }
  onNonCompliance(input: NagLoggerNonComplianceInput): void {
    const message = this.createMessage(
      input.ruleId,
      input.findingId,
      input.ruleInfo,
      input.ruleExplanation,
      this.verbose
    );
    if (input.ruleLevel == NagMessageLevel.ERROR) {
      Annotations.of(input.resource).addError(message);
    } else if (input.ruleLevel == NagMessageLevel.WARN) {
      Annotations.of(input.resource).addWarning(message);
    }
  }
  onSuppression(input: NagLoggerSuppressionInput): void {
    if (this.logIgnores) {
      const message = this.createMessage(
        this.suppressionId,
        input.findingId,
        `${input.ruleId} was triggered but suppressed.`,
        `Provided reason: "${input.suppressionReason}"`,
        this.verbose
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
      this.verbose
    );
    Annotations.of(input.resource).addWarning(message);
  }
  onSuppressedError(input: NagLoggerSuppressedErrorInput): void {
    if (this.logIgnores === true) {
      const message = this.createMessage(
        this.suppressionId,
        '',
        `${VALIDATION_FAILURE_ID} was triggered but suppressed.`,
        input.errorSuppressionReason,
        this.verbose
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

export interface NagReportSchema {
  readonly lines: NagReportLine[];
}

export interface NagReportLine {
  readonly ruleId: string;
  readonly resourceId: string;
  readonly compliance: string;
  readonly exceptionReason: string;
  readonly ruleLevel: string;
  readonly ruleInfo: string;
}

/**
 * Possible output formats of the NagReport
 */
export enum NagReportFormat {
  CSV = 'csv',
  JSON = 'json',
}

/**
 * Props for the NagReportLogger
 */
export interface NagReportLoggerProps {
  formats: NagReportFormat[];
}

/**
 * A NagLogger that creates compliance reports
 */
export class NagReportLogger implements INagLogger {
  readonly reportStacks = new Map<NagReportFormat, Array<string>>();
  readonly formats: NagReportFormat[];
  constructor(props: NagReportLoggerProps) {
    if (props.formats.length === 0) {
      throw new Error('Must provide at least 1 NagReportFormat.');
    }
    this.formats = props.formats;
  }

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
    for (const format of this.formats) {
      const stackName = input.resource.stack.nested
        ? Names.uniqueId(input.resource.stack)
        : input.resource.stack.stackName;
      const fileName = `${input.nagPackName}-${stackName}-NagReport.${format}`;
      const stacks = this.reportStacks.get(format) ?? [];
      if (!stacks.includes(fileName)) {
        const filePath = join(App.of(input.resource)?.outdir ?? '', fileName);
        this.reportStacks.set(format, [...stacks, fileName]);
        let body = '';
        if (format === NagReportFormat.CSV) {
          body =
            'Rule ID,Resource ID,Compliance,Exception Reason,Rule Level,Rule Info\n';
        } else if (format === NagReportFormat.JSON) {
          body = JSON.stringify({ lines: [] } as NagReportSchema);
        } else {
          throw new Error(
            `Unrecognized ouput format ${format} for the NagReportLogger`
          );
        }
        writeFileSync(filePath, body);
      }
    }
  }

  protected writeToStackComplianceReport(
    input: NagLoggerInputBase,
    compliance: NagLoggerCompliance
  ): void {
    for (const format of this.formats) {
      const stackName = input.resource.stack.nested
        ? Names.uniqueId(input.resource.stack)
        : input.resource.stack.stackName;
      const fileName = `${input.nagPackName}-${stackName}-NagReport.${format}`;
      const filePath = join(App.of(input.resource)?.outdir ?? '', fileName);
      if (format === NagReportFormat.CSV) {
        //| Rule ID | Resource ID | Compliance | Exception Reason | Rule Level | Rule Info
        const line = Array<string>();
        line.push(input.ruleId);
        line.push(input.resource.node.path);
        if (compliance === NagRulePostValidationStates.SUPPRESSED) {
          line.push(NagRulePostValidationStates.SUPPRESSED);
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
        appendFileSync(
          filePath,
          line.map((i) => '"' + i.replace(/"/g, '""') + '"').join(',') + '\n'
        );
      } else if (format === NagReportFormat.JSON) {
        const report = JSON.parse(
          readFileSync(filePath, 'utf8')
        ) as NagReportSchema;
        let exceptionReason = 'N/A';
        if (compliance === NagRulePostValidationStates.SUPPRESSED) {
          if (
            (input as NagLoggerSuppressionInput).suppressionReason !== undefined
          ) {
            exceptionReason = (input as NagLoggerSuppressionInput)
              .suppressionReason;
          } else {
            exceptionReason = (input as NagLoggerSuppressedErrorInput)
              .errorSuppressionReason;
          }
          report.lines.push({
            ruleId: input.ruleId,
            resourceId: input.resource.node.path,
            compliance,
            exceptionReason,
            ruleLevel: input.ruleLevel,
            ruleInfo: input.ruleInfo,
          });
          writeFileSync(filePath, JSON.stringify(report));
        }
      } else {
        throw new Error(
          `Unrecognized ouput format ${format} for the NagReportLogger`
        );
      }
    }
  }
}
