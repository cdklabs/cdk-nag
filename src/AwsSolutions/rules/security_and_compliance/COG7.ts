/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnIdentityPool } from '@aws-cdk/aws-cognito';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * Cognito identity pools do not allow for unauthenticated logins without a valid reason
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnIdentityPool) {
    const allowUnauthenticatedIdentities = resolveIfPrimitive(
      node,
      node.allowUnauthenticatedIdentities
    );
    if (allowUnauthenticatedIdentities) {
      return false;
    }
  }
  return true;
}
