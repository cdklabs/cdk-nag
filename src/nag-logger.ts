/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { appendFileSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { App, CfnResource, Names, Stage, Validations } from 'aws-cdk-lib';
import {
  NagMessageLevel,
  NagRuleCompliance,
  NagRulePostValidationStates,
  NagRuleStates,
} from './nag-rules';

/**
 * Shared data for all INagLogger methods
 * @param nagPackName The name of the NagPack that the rule belongs to.
 * @param resource The resource being validated.
 * @param ruleId The id of the rule.
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
 * Data for onError method of an INagLogger.
 * @param errorMessage The error that was thrown.
 */
export interface NagLoggerErrorData extends NagLoggerBaseData {
  readonly errorMessage: string;
}

/**
 * Data for onNotApplicable method of an INagLogger.
 */
export interface NagLoggerNotApplicableData extends NagLoggerBaseData {}

/**
 * Interface for NagLoggers that handle rule validation outputs.
 */
export interface INagLogger {
  /**
   * Called when a CfnResource passes the compliance check for a given rule.
   */
  onCompliance(data: NagLoggerComplianceData): void;
  /**
   * Called when a CfnResource does not pass the compliance check for a given rule.
   */
  onNonCompliance(data: NagLoggerNonComplianceData): void;
  /**
   * Called when a rule throws an error during validation of a CfnResource.
   */
  onError(data: NagLoggerErrorData): void;
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
}
/**
 * A NagLogger that outputs to the CDK Validations system.
 */
export class AnnotationLogger implements INagLogger {
  readonly verbose: boolean;
  constructor(props?: AnnotationLoggerProps) {
    this.verbose = props?.verbose ?? false;
  }
  onCompliance(_data: NagLoggerComplianceData): void {
    return;
  }
  onNonCompliance(data: NagLoggerNonComplianceData): void {
    const id = data.findingId
      ? `${data.ruleId}[${data.findingId}]`
      : data.ruleId;
    const message = this.createMessage(
      data.ruleInfo,
      data.ruleExplanation,
      this.verbose
    );
    switch (data.ruleLevel) {
      case NagMessageLevel.ERROR:
        Validations.of(data.resource).addError(id, message);
        break;
      case NagMessageLevel.WARN:
        Validations.of(data.resource).addWarning(id, message);
        break;
      default:
        Validations.of(data.resource).addWarning(id, message);
        break;
    }
  }
  onError(data: NagLoggerErrorData): void {
    const id = data.ruleId;
    const message = `'${data.ruleId}' threw an error during validation. This is generally caused by a parameter referencing an intrinsic function.`;
    const fullMessage = this.verbose
      ? `${message} ${data.errorMessage}`
      : message;
    Validations.of(data.resource).addWarning(id, fullMessage);
  }
  onNotApplicable(_data: NagLoggerNotApplicableData): void {
    return;
  }

  protected createMessage(
    ruleInfo: string,
    ruleExplanation: string,
    verbose: boolean
  ): string {
    return verbose ? `${ruleInfo} ${ruleExplanation}` : ruleInfo;
  }
}

export interface NagReportSchema {
  readonly lines: NagReportLine[];
}

export interface NagReportLine {
  readonly ruleId: string;
  readonly resourceId: string;
  readonly compliance: string;
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
  onError(data: NagLoggerErrorData): void {
    this.initializeStackReport(data);
    this.writeToStackComplianceReport(
      data,
      NagRulePostValidationStates.UNKNOWN
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
      const assembly = Stage.of(data.resource.stack);
      const prefix = assembly ? `${assembly.node.id}-` : '';
      const stackName = data.resource.stack.nested
        ? Names.uniqueId(data.resource.stack)
        : data.resource.stack.stackName;
      const fileName = `${data.nagPackName}-${prefix}${stackName}-NagReport.${format}`;
      const stacks = this.getFormatStacks(format);
      if (!stacks.includes(fileName)) {
        const filePath = join(App.of(data.resource)?.outdir ?? '', fileName);
        this.reportStacks.set(format, [...stacks, fileName]);
        let body = '';
        if (format === NagReportFormat.CSV) {
          body =
            'Rule ID,Resource ID,Compliance,Rule Level,Rule Info\n';
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
      const assembly = Stage.of(data.resource.stack);
      const prefix = assembly ? `${assembly.node.id}-` : '';
      const stackName = data.resource.stack.nested
        ? Names.uniqueId(data.resource.stack)
        : data.resource.stack.stackName;
      const fileName = `${data.nagPackName}-${prefix}${stackName}-NagReport.${format}`;
      const filePath = join(App.of(data.resource)?.outdir ?? '', fileName);
      if (format === NagReportFormat.CSV) {
        //| Rule ID | Resource ID | Compliance | Rule Level | Rule Info
        const line = Array<string>();
        line.push(data.ruleId);
        line.push(data.resource.node.path);
        line.push(compliance);
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
        report.lines.push({
          ruleId: data.ruleId,
          resourceId: data.resource.node.path,
          compliance,
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
