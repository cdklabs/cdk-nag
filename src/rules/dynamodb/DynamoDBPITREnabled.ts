/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnTable } from '@aws-cdk/aws-dynamodb';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * DynamoDB tables have Point-in-time Recovery enabled
 * @param node the CfnResource to check
 */

export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnTable) {
      if (node.pointInTimeRecoverySpecification == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const pitr = Stack.of(node).resolve(
        node.pointInTimeRecoverySpecification
      );
      const enabled = NagRules.resolveIfPrimitive(
        node,
        pitr.pointInTimeRecoveryEnabled
      );
      if (!enabled) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
