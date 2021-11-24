/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnIdentityPool } from 'aws-cdk-lib/aws-cognito';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Cognito identity pools do not allow for unauthenticated logins without a valid reason
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnIdentityPool) {
      const allowUnauthenticatedIdentities = NagRules.resolveIfPrimitive(
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
