/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Vpc, IVpc } from '@aws-cdk/aws-ec2';
import { FileSystem } from '@aws-cdk/aws-efs';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST_80053StorageChecks } from '../../src/NIST_800-53/NIST_800-53';

describe('Amazon Elastic File System (Amazon EFS)', () => {
    test('efs-encrypted-check: Elastic File Systems are encrypted', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new NIST_80053StorageChecks());
      new FileSystem(positive, 'rEFS', {
        vpc: new Vpc(positive, 'rVpc'),
        encrypted: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('efs-encrypted-check:'),
          }),
        }),
      );
      const negative = new Stack();
      Aspects.of(negative).add(new NIST_80053StorageChecks());
      new FileSystem(negative, 'rEFS', {
        vpc: new Vpc(negative, 'rVpc'),
        encrypted: true,
      });
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('efs-encrypted-check:'),
          }),
        }),
      );
    });
});