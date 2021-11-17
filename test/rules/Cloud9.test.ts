/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnEnvironmentEC2 } from '@aws-cdk/aws-cloud9';
import { InstanceType, InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import { Cloud9InstanceNoIngressSystemsManager } from '../../src/rules/cloud9';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [Cloud9InstanceNoIngressSystemsManager];
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

describe('AWS Cloud9', () => {
  test('Cloud9InstanceNoIngressSystemsManager: Cloud9 instances use no-ingress EC2 instances with AWS Systems Manager', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnEnvironmentEC2(nonCompliant, 'rC9Env', {
      instanceType: InstanceType.of(
        InstanceClass.T2,
        InstanceSize.MICRO
      ).toString(),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'Cloud9InstanceNoIngressSystemsManager:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnEnvironmentEC2(compliant, 'rC9Env', {
      instanceType: InstanceType.of(
        InstanceClass.T2,
        InstanceSize.MICRO
      ).toString(),
      connectionType: 'CONNECT_SSM',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'Cloud9InstanceNoIngressSystemsManager:'
          ),
        }),
      })
    );
  });
});
