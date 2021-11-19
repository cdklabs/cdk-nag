/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnIdentityPool } from 'aws-cdk-lib/aws-cognito';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Cognito identity pools do not allow for unauthenticated logins without a valid reason
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
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
  },
  'name',
  { value: parse(__filename).name }
);
