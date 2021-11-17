/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnGraphQLApi, GraphqlApi } from '@aws-cdk/aws-appsync';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import { AppSyncGraphQLRequestLogging } from '../../src/rules/appsync';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [AppSyncGraphQLRequestLogging];
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
describe('AWS AppSync', () => {
  test('AppSyncGraphQLRequestLogging: GraphQL APIs have request leveling logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new GraphqlApi(nonCompliant, 'rGraphqlApi', { name: 'foo' });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AppSyncGraphQLRequestLogging:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new GraphqlApi(nonCompliant2, 'rGraphqlApi', {
      name: 'foo',
      logConfig: { excludeVerboseContent: true },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AppSyncGraphQLRequestLogging:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnGraphQLApi(compliant, 'rGraphqlApi', {
      authenticationType: 'AMAZON_COGNITO_USER_POOL',
      name: 'foo',
      logConfig: { cloudWatchLogsRoleArn: 'foo' },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AppSyncGraphQLRequestLogging:'),
        }),
      })
    );
  });
});
