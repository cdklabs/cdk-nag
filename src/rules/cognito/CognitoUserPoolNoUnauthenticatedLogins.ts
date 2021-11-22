/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnIdentityPool } from '@aws-cdk/aws-cognito';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * Cognito identity pools do not allow for unauthenticated logins without a valid reason
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnIdentityPool) {
      const allowUnauthenticatedIdentities = resolveIfPrimitive(
        node,
        node.allowUnauthenticatedIdentities
      );
      if (allowUnauthenticatedIdentities) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
