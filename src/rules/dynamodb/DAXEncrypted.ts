/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-dax';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * DAX clusters have server-side encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      if (node.sseSpecification == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const sseSpecification = Stack.of(node).resolve(node.sseSpecification);
      const enabled = resolveIfPrimitive(node, sseSpecification.sseEnabled);
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
