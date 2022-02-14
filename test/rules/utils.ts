/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../src';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src/nag-pack';

export enum TestType {
  NON_COMPLIANCE,
  COMPLIANCE,
}
export function validateStack(stack: Stack, ruleId: String, type: TestType) {
  expect(ruleId).not.toEqual('');
  const messages = SynthUtils.synthesize(stack).messages;
  if (type === TestType.COMPLIANCE) {
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(`${ruleId}:`),
        }),
      })
    );
  } else {
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(`${ruleId}:`),
        }),
      })
    );
  }
  expect(messages).not.toContainEqual(
    expect.objectContaining({
      entry: expect.objectContaining({
        data: expect.stringMatching(`.*CdkNagValidationFailure.*${ruleId}`),
      }),
    })
  );
}

export class TestPack extends NagPack {
  readonly rules: ((node: CfnResource) => NagRuleCompliance)[];
  constructor(
    rules: ((node: CfnResource) => NagRuleCompliance)[],
    props?: NagPackProps
  ) {
    super(props);
    this.packName = 'Test';
    this.rules = rules;
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.rules.forEach((rule) => {
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
