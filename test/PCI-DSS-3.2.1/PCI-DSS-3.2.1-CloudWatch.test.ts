/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Key } from '@aws-cdk/aws-kms';
import { CfnLogGroup, LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('Amazon CloudWatch', () => {
  test('PCI.DSS.321-CloudWatchLogGroupEncrypted: - CloudWatch Log Groups are encrypted with customer managed keys - (Control ID: 3.4)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new LogGroup(nonCompliant, 'rLogGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-CloudWatchLogGroupEncrypted:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new LogGroup(compliant, 'rLogGroup', {
      encryptionKey: new Key(compliant, 'rLogsKey'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-CloudWatchLogGroupEncrypted:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-CloudWatchLogGroupRetentionPeriod: - CloudWatch Log Groups have an explicit retention period configured - (Control IDs: 3.1, 10.7)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new CfnLogGroup(nonCompliant, 'rLogGroup');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-CloudWatchLogGroupRetentionPeriod:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new LogGroup(compliant, 'rLogGroup', {
      retention: RetentionDays.ONE_YEAR,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-CloudWatchLogGroupRetentionPeriod:'
          ),
        }),
      })
    );
  });
});
