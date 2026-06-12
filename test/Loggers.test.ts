/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { NagReportFormat, NagReportSchema } from '../src/nag-logger';

describe('NagReportFormat', () => {
  test('CSV format value is correct', () => {
    expect(NagReportFormat.CSV).toBe('csv');
  });
  test('JSON format value is correct', () => {
    expect(NagReportFormat.JSON).toBe('json');
  });
});

describe('NagReportSchema', () => {
  test('Schema interface can hold report lines', () => {
    const report: NagReportSchema = {
      lines: [
        {
          ruleId: 'AwsSolutions-S1',
          resourceId: 'Stack/MyBucket/Resource',
          compliance: 'Non-Compliant',
          ruleLevel: 'Error',
          ruleInfo: 'The S3 Bucket has server access logs disabled.',
        },
      ],
    };
    expect(report.lines).toHaveLength(1);
    expect(report.lines[0].ruleId).toBe('AwsSolutions-S1');
  });
});
