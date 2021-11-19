/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { CfnReplicationInstance } from 'aws-cdk-lib/aws-dms';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import { DMSReplicationNotPublic } from '../../src/rules/dms';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [DMSReplicationNotPublic];
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

describe('AWS Database Migration Service (AWS DMS)', () => {
  test('DMSReplicationNotPublic: DMS replication instances are not public', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new TestPack());
    new CfnReplicationInstance(positive, 'rInstance', {
      replicationInstanceClass: 'dms.t2.micro',
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DMSReplicationNotPublic:'),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new TestPack());
    new CfnReplicationInstance(negative, 'rInstance', {
      replicationInstanceClass: 'dms.t2.micro',
      publiclyAccessible: false,
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('DMSReplicationNotPublic:'),
        }),
      })
    );
  });
});
