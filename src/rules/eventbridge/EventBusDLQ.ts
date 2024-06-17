/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnRule } from 'aws-cdk-lib/aws-events';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Ensure that EventBus targets have configure a DLQ
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnRule) {
      const targets: CfnRule.TargetProperty[] = Stack.of(node).resolve(
        node.targets
      );
      if (targets.every((target) => target.deadLetterConfig))
        return NagRuleCompliance.COMPLIANT;
      return NagRuleCompliance.NON_COMPLIANT;
    }
    return NagRuleCompliance.NOT_APPLICABLE;
  },
  'name',
  { value: parse(__filename).name }
);
