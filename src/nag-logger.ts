/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { appendFileSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Annotations, App, CfnResource, Names } from 'aws-cdk-lib';
import {
  NagMessageLevel,
  NagRuleCompliance,
  NagRulePostValidationStates,
  NagRuleStates,
  VALIDATION_FAILURE_ID,
} from './nag-rules';

/**
 * Shared data for all INagLogger methods
 * @param nagPackName The name of the NagPack that the rule belongs to.
 * @param resource The resource the suppression is applied to.
 * @param ruleId The id of the rule to ignore.
 * @param ruleOriginalName Original name of the rule.
 * @param ruleInfo Why the rule was triggered.
 * @param ruleExplanation Why the rule exists.
 * @param ruleLevel The severity level of the rule.
 */
export interface NagLoggerBaseData {
  readonly nagPackName: string;
  readonly resource: CfnResource;
  readonly ruleId: string;
  readonly ruleOriginalName: string;
  readonly ruleInfo: string;
  readonly ruleExplanation: string;
  readonly ruleLevel: NagMessageLevel;
}

/**
 * Data for onCompliance method of an INagLogger.
 */
export interface NagLoggerComplianceData extends NagLoggerBaseData {}
/**
 * Data for onNonCompliance method of an INagLogger.
 * @param findingId The id of the finding that is being checked.
 */
export interface NagLoggerNonComplianceData extends NagLoggerBaseData {
  readonly findingId: string;
}
/**
 * Data for onSuppressed method of an INagLogger.
 * @param suppressionReason The reason given for the suppression.
 */
export interface NagLoggerSuppressedData extends NagLoggerNonComplianceData {
  readonly suppressionReason: string;
}
/**
 * Data for onError method of an INagLogger.
 * @param errorMessage: The error that was thrown.
 * @param shouldLogIgnored Whether or not the NagPack user has indicated that they want to log suppression details.
 */
export interface NagLoggerErrorData extends NagLoggerBaseData {
  readonly errorMessage: string;
}
/**
 * Data for onSuppressedError method of an INagLogger.
 * @param errorSuppressionReason The reason given for the validation error suppression.
 */
export interface NagLoggerSuppressedErrorData extends NagLoggerErrorData {
  readonly errorSuppressionReason: string;
}

/**
 * Data for onNotApplicable method of an INagLogger.
 */
export interface NagLoggerNotApplicableData extends NagLoggerBaseData {}

/**
 * Interface for creating NagSuppression Ignores
 */
export interface INagLogger {
  /**
   * Called when a CfnResource passes the compliance check for a given rule.
   */
  onCompliance(data: NagLoggerComplianceData): void;
  /**
   * Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.
   */
  onNonCompliance(data: NagLoggerNonComplianceData): void;
  /**
   * Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.
   */
  onSuppressed(data: NagLoggerSuppressedData): void;
  /**
   * Called when a rule throws an error during while validating a CfnResource for compliance.
   */
  onError(data: NagLoggerErrorData): void;
  /**
   * Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.
   */
  onSuppressedError(data: NagLoggerSuppressedErrorData): void;
  /**
   * Called when a rule does not apply to the given CfnResource.
   */
  onNotApplicable(data: NagLoggerNotApplicableData): void;
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
 * A NagLogger that outputs to the CDK Annotations system.
 */
export class AnnotationLogger implements INagLogger {
  suppressionId = 'CdkNagSuppression';
  readonly verbose: boolean;
  readonly logIgnores: boolean;
  constructor(props?: AnnotationLoggerProps) {
    this.verbose = props?.verbose ?? false;
    this.logIgnores = props?.logIgnores ?? false;
  }
  onCompliance(_data: NagLoggerComplianceData): void {
    return;
  }
  onNonCompliance(data: NagLoggerNonComplianceData): void {
    const message = this.createMessage(
      data.ruleId,
      data.findingId,
      data.ruleInfo,
      data.ruleExplanation,
      this.verbose
    );
    if (data.ruleLevel == NagMessageLevel.ERROR) {
      Annotations.of(data.resource).addError(message);
    } else if (data.ruleLevel == NagMessageLevel.WARN) {
      Annotations.of(data.resource).addWarning(message);
    }
  }
  onSuppressed(data: NagLoggerSuppressedData): void {
    if (this.logIgnores) {
      const message = this.createMessage(
        this.suppressionId,
        data.findingId,
        `${data.ruleId} was triggered but suppressed.`,
        `Provided reason: "${data.suppressionReason}"`,
        this.verbose
      );
      Annotations.of(data.resource).addInfo(message);
    }
  }
  onError(data: NagLoggerErrorData): void {
    const information = `'${data.ruleId}' threw an error during validation. This is generally caused by a parameter referencing an intrinsic function. You can suppress the "${VALIDATION_FAILURE_ID}" to get rid of this error. For more details enable verbose logging.'`;
    const message = this.createMessage(
      VALIDATION_FAILURE_ID,
      data.ruleId,
      information,
      data.errorMessage,
      this.verbose
    );
    Annotations.of(data.resource).addWarning(message);
  }
  onSuppressedError(data: NagLoggerSuppressedErrorData): void {
    if (this.logIgnores === true) {
      const message = this.createMessage(
        this.suppressionId,
        data.ruleId,
        `${VALIDATION_FAILURE_ID} was triggered but suppressed.`,
        data.errorSuppressionReason,
        this.verbose
      );
      Annotations.of(data.resource).addInfo(message);
    }
  }
  onNotApplicable(_data: NagLoggerNotApplicableData): void {
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
  readonly formats: NagReportFormat[];
}

/**
 * A NagLogger that creates compliance reports
 */
export class NagReportLogger implements INagLogger {
  private reportStacks = new Map<NagReportFormat, Array<string>>();
  readonly formats: NagReportFormat[];
  constructor(props: NagReportLoggerProps) {
    if (props.formats.length === 0) {
      throw new Error('Must provide at least 1 NagReportFormat.');
    }
    this.formats = props.formats;
  }

  onCompliance(data: NagLoggerComplianceData): void {
    this.initializeStackReport(data);
    this.writeToStackComplianceReport(data, NagRuleCompliance.COMPLIANT);
  }
  onNonCompliance(data: NagLoggerNonComplianceData): void {
    this.initializeStackReport(data);
    this.writeToStackComplianceReport(data, NagRuleCompliance.NON_COMPLIANT);
  }
  onSuppressed(data: NagLoggerSuppressedData): void {
    this.initializeStackReport(data);
    this.writeToStackComplianceReport(
      data,
      NagRulePostValidationStates.SUPPRESSED
    );
  }
  onError(data: NagLoggerErrorData): void {
    this.initializeStackReport(data);
    this.writeToStackComplianceReport(
      data,
      NagRulePostValidationStates.UNKNOWN
    );
  }
  onSuppressedError(data: NagLoggerSuppressedErrorData): void {
    this.initializeStackReport(data);
    this.writeToStackComplianceReport(
      data,
      NagRulePostValidationStates.SUPPRESSED
    );
  }
  onNotApplicable(data: NagLoggerNotApplicableData): void {
    this.initializeStackReport(data);
  }

  public getFormatStacks(format: NagReportFormat): string[] {
    return this.reportStacks.get(format) ?? [];
  }

  /**
   * Initialize the report for the rule pack's compliance report for the resource's Stack if it doesn't exist
   * @param data
   */
  protected initializeStackReport(data: NagLoggerBaseData): void {
    for (const format of this.formats) {
      const stackName = data.resource.stack.nested
        ? Names.uniqueId(data.resource.stack)
        : data.resource.stack.stackName;
      const fileName = `${data.nagPackName}-${stackName}-NagReport.${format}`;
      const stacks = this.getFormatStacks(format);
      if (!stacks.includes(fileName)) {
        const filePath = join(App.of(data.resource)?.outdir ?? '', fileName);
        this.reportStacks.set(format, [...stacks, fileName]);
        let body = '';
        if (format === NagReportFormat.CSV) {
          body =
            'Rule ID,Resource ID,Compliance,Exception Reason,Rule Level,Rule Info\n';
        } else if (format === NagReportFormat.JSON) {
          body = JSON.stringify({ lines: [] } as NagReportSchema);
        } else {
          throw new Error(
            `Unrecognized output format ${format} for the NagReportLogger`
          );
        }
        writeFileSync(filePath, body);
      }
    }
  }

  protected writeToStackComplianceReport(
    data: NagLoggerBaseData,
    compliance: NagRuleStates
  ): void {
    for (const format of this.formats) {
      const stackName = data.resource.stack.nested
        ? Names.uniqueId(data.resource.stack)
        : data.resource.stack.stackName;
      const fileName = `${data.nagPackName}-${stackName}-NagReport.${format}`;
      const filePath = join(App.of(data.resource)?.outdir ?? '', fileName);
      if (format === NagReportFormat.CSV) {
        //| Rule ID | Resource ID | Compliance | Exception Reason | Rule Level | Rule Info
        const line = Array<string>();
        line.push(data.ruleId);
        line.push(data.resource.node.path);
        if (compliance === NagRulePostValidationStates.SUPPRESSED) {
          line.push(NagRulePostValidationStates.SUPPRESSED);
          if (
            (data as NagLoggerSuppressedData).suppressionReason !== undefined
          ) {
            line.push((data as NagLoggerSuppressedData).suppressionReason);
          } else {
            line.push(
              (data as NagLoggerSuppressedErrorData).errorSuppressionReason
            );
          }
        } else {
          line.push(compliance);
          line.push('N/A');
        }
        line.push(data.ruleLevel);
        line.push(data.ruleInfo);
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
            (data as NagLoggerSuppressedData).suppressionReason !== undefined
          ) {
            exceptionReason = (data as NagLoggerSuppressedData)
              .suppressionReason;
          } else {
            exceptionReason = (data as NagLoggerSuppressedErrorData)
              .errorSuppressionReason;
          }
        }
        report.lines.push({
          ruleId: data.ruleId,
          resourceId: data.resource.node.path,
          compliance,
          exceptionReason,
          ruleLevel: data.ruleLevel,
          ruleInfo: data.ruleInfo,
        });
        writeFileSync(filePath, JSON.stringify(report));
      } else {
        throw new Error(
          `Unrecognized output format ${format} for the NagReportLogger`
        );
      }
    }
  }
}
