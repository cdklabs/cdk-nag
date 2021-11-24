/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDomain as LegacyCfnDomain } from 'aws-cdk-lib/aws-elasticsearch';
import { CfnDomain } from 'aws-cdk-lib/aws-opensearchservice';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * OpenSearch Service domains do not allow for unsigned requests or anonymous access
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
      const accessPolicies = Stack.of(node).resolve(node.accessPolicies);
      if (accessPolicies == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const statements = accessPolicies?.Statement;
      if (statements == undefined || statements.length == 0) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      for (const statement of statements) {
        if (statement.Effect == 'Allow') {
          const awsString = statement.Principal
            ? JSON.stringify(statement.Principal)
            : '';
          if (awsString.includes('*')) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
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
