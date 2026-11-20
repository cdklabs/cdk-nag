/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource } from 'aws-cdk-lib';
import { NagRules } from '../nag-rules';

/**
 * Resolve a primitive value nested one level inside an object property
 * @param node the CfnResource to check
 * @param parameter the object property to resolve
 * @param key the key of the nested value
 * @returns the resolved nested value
 */
export function resolveNestedPrimitive(
  node: CfnResource,
  parameter: any,
  key: string
): any {
  return NagRules.resolveIfPrimitive(
    node,
    NagRules.resolveIfNotIntrinsic(node, parameter)?.[key]
  );
}
