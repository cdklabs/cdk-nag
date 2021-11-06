/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { BackupPlan, BackupResource } from '@aws-cdk/aws-backup';
import { Vpc } from '@aws-cdk/aws-ec2';
import { FileSystem } from '@aws-cdk/aws-efs';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R4Checks } from '../../src';

describe('Amazon Elastic File System (Amazon EFS)', () => {
  test('nist80053r4EFSEncrypted: Elastic File Systems are encrypted', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new FileSystem(positive, 'rEFS', {
      vpc: new Vpc(positive, 'rVpc'),
      encrypted: false,
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-EFSEncrypted:'),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());
    new FileSystem(negative, 'rEFS', {
      vpc: new Vpc(negative, 'rVpc'),
      encrypted: true,
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-EFSEncrypted:'),
        }),
      })
    );
  });
  test('NIST.800.53.R4-EFSInBackupPlan: - EFSs are part of AWS Backup plan(s) - (Control IDs: CP-9(b), CP-10, SI-12)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new FileSystem(nonCompliant, 'rEFS', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-EFSInBackupPlan:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
    new FileSystem(nonCompliant2, 'rEFS', {
      vpc: new Vpc(nonCompliant2, 'rVpc'),
    });
    BackupPlan.dailyWeeklyMonthly5YearRetention(
      nonCompliant2,
      'rPlan'
    ).addSelection('Selection', {
      resources: [
        BackupResource.fromEfsFileSystem(
          new FileSystem(nonCompliant2, 'rEFS2', {
            vpc: new Vpc(nonCompliant2, 'rVpc2'),
          })
        ),
      ],
    });

    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-EFSInBackupPlan:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
    BackupPlan.dailyWeeklyMonthly5YearRetention(
      compliant,
      'rPlan'
    ).addSelection('Selection', {
      resources: [
        BackupResource.fromEfsFileSystem(
          new FileSystem(compliant, 'rEFS', {
            vpc: new Vpc(compliant, 'rVpc'),
          })
        ),
      ],
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-EC2EBSInBackupPlan:'),
        }),
      })
    );
  });
});
