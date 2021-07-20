/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnUserPool } from '@aws-cdk/aws-cognito';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Cognito user pools have AdvancedSecurityMode set to ENFORCED
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnUserPool) {
    const userPoolAddOns = Stack.of(node).resolve(node.userPoolAddOns);
    if (userPoolAddOns == undefined) {
      return false;
    }
    const advancedSecurityMode = Stack.of(node).resolve(
      userPoolAddOns.advancedSecurityMode,
    );
    if (
      advancedSecurityMode == undefined ||
      advancedSecurityMode != 'ENFORCED'
    ) {
      return false;
    }
  }
  return true;
}
