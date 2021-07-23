/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import { FileSystem } from '@aws-cdk/aws-efs';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src/NIST-800-53/nist-800-53';

describe('Amazon Elastic File System (Amazon EFS)', () => {
  test('nist80053EFSEncrypted: Elastic File Systems are encrypted', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053Checks());
    new FileSystem(positive, 'rEFS', {
      vpc: new Vpc(positive, 'rVpc'),
      encrypted: false,
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53-EFSEncrypted:'),
        }),
      }),
    );
    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053Checks());
    new FileSystem(negative, 'rEFS', {
      vpc: new Vpc(negative, 'rVpc'),
      encrypted: true,
    });
    console.log(JSON.stringify(SynthUtils.toCloudFormation(negative)));
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53-EFSEncrypted:'),
        }),
      }),
    );
  });
});
