/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { INagSuppressionIgnore, NagRuleResult } from '../../src';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src/nag-pack';

export enum TestType {
  NON_COMPLIANCE,
  COMPLIANCE,
  VALIDATION_FAILURE,
}
export function validateStack(stack: Stack, ruleId: String, type: TestType) {
  expect(ruleId).not.toEqual('');
  const messages = SynthUtils.synthesize(stack).messages;
  switch (type) {
    case TestType.COMPLIANCE:
      expect(messages).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringMatching(`.*${ruleId}(\\[.*\\])?:`),
          }),
        })
      );
      noValidationFailure();
      break;
    case TestType.NON_COMPLIANCE:
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(`${ruleId}:`),
          }),
        })
      );
      noValidationFailure();
      break;
    case TestType.VALIDATION_FAILURE:
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringMatching(`.*CdkNagValidationFailure.*${ruleId}`),
          }),
        })
      );
      break;
  }

  function noValidationFailure() {
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringMatching(`.*CdkNagValidationFailure.*${ruleId}`),
        }),
      })
    );
  }
}

export class TestPack extends NagPack {
  readonly rules: ((node: CfnResource) => NagRuleResult)[];
  readonly ignoreSuppressionCondition?: INagSuppressionIgnore;
  readonly ruleSuffixOverride?: string;
  constructor(
    rules: ((node: CfnResource) => NagRuleResult)[],
    ignoreSuppressionCondition?: INagSuppressionIgnore,
    ruleSuffixOverride?: string,
    props?: NagPackProps
  ) {
    super(props);
    this.packName = 'Test';
    this.rules = rules;
    this.ignoreSuppressionCondition = ignoreSuppressionCondition;
    this.ruleSuffixOverride = ruleSuffixOverride;
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.rules.forEach((rule) => {
        this.applyRule({
          ruleSuffixOverride: this.ruleSuffixOverride,
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          ignoreSuppressionCondition: this.ignoreSuppressionCondition,
          node: node,
        });
      });
    }
  }
}
