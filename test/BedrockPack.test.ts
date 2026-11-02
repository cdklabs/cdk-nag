/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Stack } from 'aws-cdk-lib';
import { CfnAgent, CfnDataSource, CfnGuardrail } from 'aws-cdk-lib/aws-bedrock';
import { AwsSolutionsChecks } from '../src';

const keyArn =
  'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012';

function createResources(stack: Stack, compliant: boolean): void {
  new CfnAgent(stack, 'Agent', {
    agentName: 'test-agent',
    customerEncryptionKeyArn: compliant ? keyArn : undefined,
    guardrailConfiguration: compliant
      ? { guardrailIdentifier: 'abcdef123456', guardrailVersion: '1' }
      : undefined,
  });
  new CfnGuardrail(stack, 'Guardrail', {
    name: 'test-guardrail',
    blockedInputMessaging: 'Input blocked.',
    blockedOutputsMessaging: 'Output blocked.',
    kmsKeyArn: compliant ? keyArn : undefined,
  });
  new CfnDataSource(stack, 'DataSource', {
    name: 'test-data-source',
    knowledgeBaseId: 'ABCDEFGHIJ',
    dataSourceConfiguration: { type: 'CUSTOM' },
    serverSideEncryptionConfiguration: compliant
      ? { kmsKeyArn: keyArn }
      : undefined,
  });
}

describe('Bedrock rules in AwsSolutionsChecks', () => {
  test.each(['BR1', 'BR2', 'BR3', 'BR4'])(
    'reports missing protection as AwsSolutions-%s',
    (suffix) => {
      const stack = new Stack();
      createResources(stack, false);
      const report = new AwsSolutionsChecks().validateScope(stack);
      expect(report.violations.map((v) => v.ruleName)).toContain(
        `AwsSolutions-${suffix}`
      );
      expect(
        report.violations.some((v) => v.description.includes('threw an error'))
      ).toBe(false);
    }
  );

  test('accepts resources with keys and an associated guardrail', () => {
    const stack = new Stack();
    createResources(stack, true);
    const report = new AwsSolutionsChecks().validateScope(stack);
    expect(report.violations).toEqual([]);
  });
});
