/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import { FileSystem } from '@aws-cdk/aws-efs';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('Amazon Elastic File System (Amazon EFS)', () => {
  test('PCI.DSS.321-EFSEncrypted: - Elastic File Systems are configured for encryption at rest - (Control IDs: 3.4, 8.2.1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new FileSystem(nonCompliant, 'rEFS', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      encrypted: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-EFSEncrypted:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new FileSystem(compliant, 'rEFS', {
      vpc: new Vpc(compliant, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-EFSEncrypted:'),
        }),
      })
    );
  });
});
