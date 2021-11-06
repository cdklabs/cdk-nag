/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { BackupPlan, BackupResource } from '@aws-cdk/aws-backup';
import { Vpc } from '@aws-cdk/aws-ec2';
import { FileSystem } from '@aws-cdk/aws-efs';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon Elastic File System (Amazon EFS)', () => {
  test('NIST.800.53.R5-EFSEncrypted: - Elastic File Systems are configured for encryption at rest - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new FileSystem(nonCompliant, 'rEFS', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      encrypted: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-EFSEncrypted:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new FileSystem(compliant, 'rEFS', {
      vpc: new Vpc(compliant, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-EFSEncrypted:'),
        }),
      })
    );
  });
  test('NIST.800.53.R5-EFSInBackupPlan: - EFSs are part of AWS Backup plan(s) - (Control IDs: CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), SC-5(2), SI-13(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new FileSystem(nonCompliant, 'rEFS', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-EFSInBackupPlan:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-EFSInBackupPlan:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-EC2EBSInBackupPlan:'),
        }),
      })
    );
  });
});
