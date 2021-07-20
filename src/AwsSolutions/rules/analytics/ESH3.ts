/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ES domains only grant access via allowlisted IP addresses
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDomain) {
    const accessPolicies = Stack.of(node).resolve(node.accessPolicies);
    if (accessPolicies == undefined) {
      return false;
    }
    const statements = accessPolicies?.Statement;
    if (statements == undefined || statements.length == 0) {
      return false;
    }
    for (const statement of statements) {
      if (statement.Effect == 'Allow') {
        const allowList = statement?.Condition?.IpAddress?.['aws:sourceIp'];
        if (allowList == undefined || allowList.length == 0) {
          return false;
        }
      }
    }
  }
  return true;
}
