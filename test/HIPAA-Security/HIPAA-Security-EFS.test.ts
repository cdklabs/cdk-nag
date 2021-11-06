/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { BackupPlan, BackupResource } from '@aws-cdk/aws-backup';
import { Vpc } from '@aws-cdk/aws-ec2';
import { FileSystem } from '@aws-cdk/aws-efs';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('Amazon Elastic File System (Amazon EFS)', () => {
  test('hipaaSecurityEFSEncrypted: - Elastic File Systems are configured for encryption at rest - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new FileSystem(nonCompliant, 'rEFS', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
      encrypted: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-EFSEncrypted:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new FileSystem(compliant, 'rEFS', {
      vpc: new Vpc(compliant, 'rVpc'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-EFSEncrypted:'),
        }),
      })
    );
  });
  test('HIPAA.Security-EFSInBackupPlan: - EFSs are part of AWS Backup plan(s) - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new FileSystem(nonCompliant, 'rEFS', {
      vpc: new Vpc(nonCompliant, 'rVpc'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-EFSInBackupPlan:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-EFSInBackupPlan:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-EC2EBSInBackupPlan:'),
        }),
      })
    );
  });
});
