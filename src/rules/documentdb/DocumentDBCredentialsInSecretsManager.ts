/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-docdb';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Document DB clusters have the username and password stored in Secrets Manager
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBCluster) {
      const masterUsername = NagRules.resolveIfPrimitive(
        node,
        node.masterUsername
      );
      const masterUserPassword = NagRules.resolveIfPrimitive(
        node,
        node.masterUserPassword
      );
      if (
        masterUsername.includes('{{resolve:secretsmanager') == false ||
        masterUserPassword.includes('{{resolve:secretsmanager') == false
      ) {
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
