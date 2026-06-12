/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { App, CfnResource, Stack } from 'aws-cdk-lib';
import { NagPack, NagPackProps } from '../../src/nag-pack';
import { NagMessageLevel, NagRuleResult } from '../../src/nag-rules';

export enum TestType {
  NON_COMPLIANCE,
  COMPLIANCE,
  ERROR,
}

let _activePack: TestPack | undefined;

export function validateStack(stack: Stack, ruleId: String, type: TestType) {
  expect(ruleId).not.toEqual('');
  if (!_activePack) {
    throw new Error('No active TestPack. Call setActivePack() in beforeEach.');
  }
  const scope = App.of(stack) ?? stack;
  const report = _activePack.validateScope(scope);
  switch (type) {
    case TestType.COMPLIANCE:
      expect(
        report.violations.some((v) =>
          new RegExp(`.*${ruleId}(\\[.*\\])?`).test(v.ruleName)
        )
      ).toBe(false);
      break;
    case TestType.NON_COMPLIANCE:
      expect(
        report.violations.some((v) => v.ruleName.includes(`${ruleId}`))
      ).toBe(true);
      break;
    case TestType.ERROR:
      expect(
        report.violations.some(
          (v) =>
            v.ruleName.includes(`${ruleId}`) &&
            v.description.includes('threw an error')
        )
      ).toBe(true);
      break;
  }
}

export function setActivePack(pack: TestPack): void {
  _activePack = pack;
}

export class TestPack extends NagPack {
  public readonly name = 'Test';
  readonly rules: ((node: CfnResource) => NagRuleResult)[];
  readonly ruleSuffixOverride?: string;
  readonly level?: NagMessageLevel;
  constructor(
    rules: ((node: CfnResource) => NagRuleResult)[],
    ruleSuffixOverride?: string,
    level?: NagMessageLevel,
    props?: NagPackProps
  ) {
    super(undefined, props);
    this.packName = 'Test';
    this.rules = rules;
    this.ruleSuffixOverride = ruleSuffixOverride;
    this.level = level;
  }
  protected checkResource(node: CfnResource): void {
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
