/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster, CfnClusterParameterGroup } from '@aws-cdk/aws-redshift';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../../nag-pack';

/**
 * Redshift clusters require TLS/SSL encryption - (Control IDs: AC-4, AC-4(22), AC-24(1), AU-9(3), CA-9b, PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SI-1a.2, SI-1a.2, SI-1c.2)
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
