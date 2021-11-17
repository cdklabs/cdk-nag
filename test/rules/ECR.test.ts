/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Repository } from '@aws-cdk/aws-ecr';
import {
  PolicyStatement,
  Effect,
  AccountPrincipal,
  AccountRootPrincipal,
} from '@aws-cdk/aws-iam';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import { ECROpenAccess } from '../../src/rules/ecr';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [ECROpenAccess];
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

describe('Amazon Elastic Container Registry (ECR)', () => {
  test('Ecr1: ECR Repositories do not allow open access', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    const repo = new Repository(nonCompliant, 'rRepo');
    repo.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['*'],
        principals: [new AccountPrincipal('*'), new AccountRootPrincipal()],
      })
    );
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ECROpenAccess:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Repository(compliant, 'rRepo');
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ECROpenAccess:'),
        }),
      })
    );
  });
});
