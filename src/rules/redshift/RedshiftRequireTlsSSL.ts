/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnCluster, CfnClusterParameterGroup } from 'aws-cdk-lib/aws-redshift';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Redshift clusters require TLS/SSL encryption
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
          if (isMatchingParameterGroup(child, clusterParameterGroupName)) {
            found = true;
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
 * Helper function to check whether the Parameter Group enforces SSL and is associated with the given Redshift cluster
 * @param node the CfnClusterParameterGroup to check
 * @param parameterGroupName The name of the associated parameter group
 * returns whether the CfnClusterParameterGroup enforces SSL and is associated given Redshift cluster
 */
function isMatchingParameterGroup(
  node: CfnClusterParameterGroup,
  parameterGroupName: string
): boolean {
  const parameterGroupLogicalId = NagRules.resolveResourceFromInstrinsic(
    node,
    node.ref
  );
  if (
    parameterGroupName !== parameterGroupLogicalId ||
    node.parameters == undefined
  ) {
    return false;
  }
  const parameters = Stack.of(node).resolve(node.parameters);
  for (const parameter of parameters) {
    const resolvedParameter = Stack.of(node).resolve(parameter);
    if (
      resolvedParameter.parameterName.toLowerCase() == 'require_ssl' &&
      resolvedParameter.parameterValue.toLowerCase() == 'true'
    ) {
      return true;
    }
  }
  return false;
}
