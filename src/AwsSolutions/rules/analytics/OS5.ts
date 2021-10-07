/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * OpenSearch Service domains do not allow for unsigned requests or anonymous access
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
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
        const awsString = statement.Principal
          ? JSON.stringify(statement.Principal)
          : '';
        if (awsString.includes('*')) {
          return false;
        }
      }
    }
  }
  return true;
}
