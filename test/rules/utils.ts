/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPack, NagPackProps } from '../../src/nag-pack';
import { NagMessageLevel, NagRuleResult } from '../../src/nag-rules';

export enum TestType {
  NON_COMPLIANCE,
  COMPLIANCE,
  ERROR,
}
export function validateStack(stack: Stack, ruleId: String, type: TestType) {
  expect(ruleId).not.toEqual('');
  const messages = SynthUtils.synthesize(stack).messages;
  switch (type) {
    case TestType.COMPLIANCE:
      expect(messages).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringMatching(`.*${ruleId}(\\[.*\\])?`),
          }),
        })
      );
      break;
    case TestType.NON_COMPLIANCE:
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(`${ruleId}`),
          }),
        })
      );
      break;
    case TestType.ERROR:
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringMatching(`.*${ruleId}.*threw an error`),
          }),
        })
      );
      break;
  }
}

export class TestPack extends NagPack {
  readonly rules: ((node: CfnResource) => NagRuleResult)[];
  readonly ruleSuffixOverride?: string;
  readonly level?: NagMessageLevel;
  constructor(
    rules: ((node: CfnResource) => NagRuleResult)[],
    ruleSuffixOverride?: string,
    level?: NagMessageLevel,
    props?: NagPackProps
  ) {
    super(props);
    this.packName = 'Test';
    this.rules = rules;
    this.ruleSuffixOverride = ruleSuffixOverride;
    this.level = level;
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.rules.forEach((rule) => {
        this.applyRule({
          ruleSuffixOverride: this.ruleSuffixOverride,
          info: 'foo.',
          explanation: 'bar.',
          level: this.level ?? NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}
