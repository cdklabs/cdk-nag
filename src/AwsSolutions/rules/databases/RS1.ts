/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnClusterParameterGroup } from '@aws-cdk/aws-redshift';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Redshift cluster parameter groups must have the "require_ssl" parameter enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnClusterParameterGroup) {
      if (node.parameters == undefined) {
        return false;
      }
      const parameters = Stack.of(node).resolve(node.parameters);
      let enabled = false;
      for (const parameter of parameters) {
        const resolvedParameter = Stack.of(node).resolve(parameter);
        if (
          resolvedParameter.parameterName.toLowerCase() == 'require_ssl' &&
          resolvedParameter.parameterValue.toLowerCase() == 'true'
        ) {
          enabled = true;
          break;
        }
      }
      if (!enabled) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
