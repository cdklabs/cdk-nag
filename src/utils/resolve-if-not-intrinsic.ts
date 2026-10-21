/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource, Stack } from 'aws-cdk-lib';

/**
 * Resolve a property, throwing if it resolves to an intrinsic function whose nested values cannot be inspected
 * @param node the CfnResource to check
 * @param parameter the value to attempt to resolve
 * @returns the resolved value
 */
export function resolveIfNotIntrinsic(node: CfnResource, parameter: any): any {
  const resolvedValue = Stack.of(node).resolve(parameter);
  if (
    resolvedValue === Object(resolvedValue) &&
    !Array.isArray(resolvedValue) &&
    Object.keys(resolvedValue).some(
      (key) => key === 'Ref' || key.startsWith('Fn::')
    )
  ) {
    throw Error(
      `The parameter resolved to an intrinsic function "${JSON.stringify(
        resolvedValue
      )}", therefore the rule could not be validated.`
    );
  }
  return resolvedValue;
}
