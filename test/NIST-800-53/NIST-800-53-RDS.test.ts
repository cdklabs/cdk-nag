/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { DatabaseInstance, 
    DatabaseInstanceEngine,
    MariaDbEngineVersion,
 } from '@aws-cdk/aws-rds';
import { Vpc } from '@aws-cdk/aws-ec2';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST 800-53 Compliance Checks', () => {
  describe('Amazon Relational Database Service (RDS)', () => {
    test('NIST.800.53-RDSLoggingEnabled: RDS Database Instances have all Cloudwatch logging exports enabled', () => {

      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());
      
      new DatabaseInstance(nonCompliant, 'rDbInstance', {
        engine: DatabaseInstanceEngine.mariaDb({
          version: MariaDbEngineVersion.VER_10_2,
        }),
        port: 5432,
        vpc: new Vpc(nonCompliant, 'rVpc'),
      });

      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-RDSLoggingEnabled:'),
          }),
        }),
      );

      const compliant = new Stack();
      Aspects.of(compliant).add(new NIST80053Checks());

      new DatabaseInstance(compliant, 'rDbInstance', {
        engine: DatabaseInstanceEngine.mariaDb({
          version: MariaDbEngineVersion.VER_10_2,
        }),
        port: 5432,
        vpc: new Vpc(compliant, 'rVpc'),
        cloudwatchLogsExports: ['audit', 'error', 'general', 'slowquery']
      });

      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-RDSLoggingEnabled:'),
          }),
        }),
      );
    });

    const passiveCompliant = new Stack();
      Aspects.of(passiveCompliant).add(new NIST80053Checks());
      
      const messages3 = SynthUtils.synthesize(passiveCompliant).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-RDSLoggingEnabled:'),
          }),
        }),
      );

  });
});
