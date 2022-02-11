/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack, Duration } from 'aws-cdk-lib';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Function } from 'aws-cdk-lib/aws-lambda';
import {
  Secret,
  CfnSecret,
  HostedRotation,
  CfnRotationSchedule,
  CfnSecretTargetAttachment,
} from 'aws-cdk-lib/aws-secretsmanager';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  SecretsManagerRotationEnabled,
  SecretsManagerUsingKMSKey,
} from '../../src/rules/secretsmanager';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [SecretsManagerRotationEnabled, SecretsManagerUsingKMSKey];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('AWS Secrets Manager', () => {
  test('SecretsManagerRotationEnabled: Secrets have automatic rotation scheduled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Secret(nonCompliant, 'rSecret1');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SecretsManagerRotationEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnRotationSchedule(nonCompliant2, 'rRotationSchedule', {
      secretId: new CfnSecretTargetAttachment(
        nonCompliant2,
        'rCfnTargetAttachment',
        {
          secretId: new Secret(nonCompliant2, 'rSecret').secretArn,
          targetId: 'foo',
          targetType: 'bar',
        }
      ).ref,
      hostedRotationLambda: { rotationType: 'baz' },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SecretsManagerRotationEnabled:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnRotationSchedule(nonCompliant3, 'rRotationSchedule', {
      secretId: new CfnSecretTargetAttachment(
        nonCompliant3,
        'rCfnTargetAttachment',
        {
          secretId: new Secret(nonCompliant3, 'rSecret').secretArn,
          targetId: 'foo',
          targetType: 'bar',
        }
      ).ref,
      rotationRules: {
        automaticallyAfterDays: 42,
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SecretsManagerRotationEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Secret(compliant, 'rSecret1').addRotationSchedule(
      'rRotationSchedule1',
      { hostedRotation: HostedRotation.mysqlSingleUser() }
    );
    new Secret(compliant, 'rSecret2').addRotationSchedule(
      'rRotationSchedule2',
      {
        rotationLambda: Function.fromFunctionArn(
          compliant,
          'rLambda',
          'arn:aws:lambda:us-east-1:111222333444:function:helloworld'
        ),
        automaticallyAfter: Duration.days(30),
      }
    );
    new CfnRotationSchedule(compliant, 'rRotationSchedule3', {
      secretId: new CfnSecretTargetAttachment(
        compliant,
        'rCfnTargetAttachment',
        {
          secretId: new Secret(compliant, 'rSecret3').secretArn,
          targetId: 'foo',
          targetType: 'bar',
        }
      ).ref,
      rotationLambdaArn: 'baz',
      rotationRules: {
        automaticallyAfterDays: 42,
      },
    });
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SecretsManagerRotationEnabled:'),
        }),
      })
    );
  });

  test('SecretsManagerUsingKMSKey: Secrets are encrypted with KMS Customer managed keys', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Secret(nonCompliant, 'rSecret');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SecretsManagerUsingKMSKey:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnSecret(nonCompliant2, 'rSecret', {
      kmsKeyId: 'aws/secretsmanager',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SecretsManagerUsingKMSKey:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Secret(compliant, 'rSecret', {
      encryptionKey: new Key(compliant, 'rKey'),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SecretsManagerUsingKMSKey:'),
        }),
      })
    );
  });
});
