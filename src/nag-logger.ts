/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * Schema for the NagReport output.
 */
export interface NagReportSchema {
  readonly lines: NagReportLine[];
}

/**
 * A single line in a NagReport.
 */
export interface NagReportLine {
  readonly ruleId: string;
  readonly resourceId: string;
  readonly compliance: string;
  readonly ruleLevel: string;
  readonly ruleInfo: string;
}

/**
 * Possible output formats of the NagReport.
 */
export enum NagReportFormat {
  CSV = 'csv',
  JSON = 'json',
}
