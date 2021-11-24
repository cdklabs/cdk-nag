/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster, CfnClusterParameterGroup } from '@aws-cdk/aws-redshift';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Redshift clusters have user user activity logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      const clusterParameterGroupName = NagRules.resolveResourceFromInstrinsic(
        node,
        node.clusterParameterGroupName
      );
      if (clusterParameterGroupName === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnClusterParameterGroup) {
          const childParameterGroupName =
            NagRules.resolveResourceFromInstrinsic(node, child.ref);
          if (childParameterGroupName === clusterParameterGroupName) {
            found = isCompliantClusterParameterGroup(child);
            break;
          }
        }
      }
      if (!found) {
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

/**
 * Helper function to check whether a given cluster parameter group is compliant
 * @param node the CfnClusterParameterGroup to check
 * returns whether the Cluster Parameter group is compliant
 */
function isCompliantClusterParameterGroup(
  node: CfnClusterParameterGroup
): boolean {
  const resolvedParameters = Stack.of(node).resolve(node.parameters);
  if (resolvedParameters == undefined) {
    return false;
  }
  for (const parameter of resolvedParameters) {
    const resolvedParam = Stack.of(node).resolve(parameter);
    if (
      resolvedParam.parameterName === 'enable_user_activity_logging' &&
      resolvedParam.parameterValue === 'true'
    ) {
      return true;
    }
  }
  return false;
}
