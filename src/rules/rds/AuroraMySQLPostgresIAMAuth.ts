/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBCluster } from 'aws-cdk-lib/aws-rds';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * RDS Aurora MySQL/PostgresSQL clusters have IAM Database Authentication enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBCluster) {
      if (!node.engine) return NagRuleCompliance.NOT_APPLICABLE;
      if (node.engine.toLowerCase().includes('aurora')) {
        if (node.enableIamDatabaseAuthentication == undefined) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
        const iamAuth = NagRules.resolveIfPrimitive(
          node,
          node.enableIamDatabaseAuthentication
        );
        if (iamAuth == false) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
