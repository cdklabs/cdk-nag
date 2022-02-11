/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  AnyPrincipal,
  StarPrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { CfnTopicPolicy, Topic } from 'aws-cdk-lib/aws-sns';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import { SNSEncryptedKMS, SNSTopicSSLRequestsOnly } from '../../src/rules/sns';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [SNSEncryptedKMS, SNSTopicSSLRequestsOnly];
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

describe('Amazon Simple Notification Service (Amazon SNS)', () => {
  test('SNSEncryptedKMS: SNS topics are encrypted via KMS', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Topic(nonCompliant, 'rTopic');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SNSEncryptedKMS:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Topic(compliant, 'rTopic', { masterKey: new Key(compliant, 'rKey') });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SNSEncryptedKMS:'),
        }),
      })
    );
  });

  test('SNSTopicSSLRequestsOnly: SNS topics require SSL requests', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Topic(nonCompliant, 'rTopic');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SNSTopicSSLRequestsOnly:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Topic(nonCompliant2, 'rTopic', { topicName: 'foo' });
    new CfnTopicPolicy(nonCompliant2, 'rTopicPolicy', {
      topics: ['foo'],
      policyDocument: new PolicyDocument({
        statements: [
          new PolicyStatement({
            actions: ['SNS:*'],
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            conditions: { Bool: { 'aws:SecureTransport': false } },
            resources: ['foo'],
          }),
        ],
      }).toJSON(),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SNSTopicSSLRequestsOnly:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Topic(compliant, 'rTopic', { topicName: 'foo' });
    new Topic(compliant, 'rTopic2', { masterKey: new Key(compliant, 'rKey') });
    new Topic(compliant, 'rTopic3').addToResourcePolicy(
      new PolicyStatement({
        actions: ['sns:publish', '*'],
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        conditions: { Bool: { 'aws:SecureTransport': 'false' } },
        resources: ['foo'],
      })
    );
    new CfnTopicPolicy(compliant, 'rTopicPolicy', {
      topics: ['foo'],
      policyDocument: new PolicyDocument({
        statements: [
          new PolicyStatement({
            actions: ['sns:*'],
            effect: Effect.DENY,
            principals: [new StarPrincipal()],
            conditions: { Bool: { 'aws:SecureTransport': false } },
            resources: ['foo'],
          }),
        ],
      }).toJSON(),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('SNSTopicSSLRequestsOnly:'),
        }),
      })
    );
  });
});
