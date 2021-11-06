/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster, CfnClusterParameterGroup } from '@aws-cdk/aws-redshift';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../../nag-pack';

/**
 * Redshift clusters require TLS/SSL encryption - (Control IDs: 2.3, 4.1)
 * @param node the CfnResource to check
 */

export default function (node: CfnResource): boolean {
  if (node instanceof CfnCluster) {
    const clusterParameterGroupName = resolveResourceFromInstrinsic(
      node,
      node.clusterParameterGroupName
    );
    if (clusterParameterGroupName === undefined) {
      return false;
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
      return false;
    }
  }
  return true;
}

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
  const parameterGroupLogicalId = resolveResourceFromInstrinsic(node, node.ref);
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
