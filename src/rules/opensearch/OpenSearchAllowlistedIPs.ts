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
 * OpenSearch Service domains only grant access via allowlisted IP addresses
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
      const accessPolicies =
        getPolicyFromCR() ?? Stack.of(node).resolve(node.accessPolicies);
      if (accessPolicies === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const statements = accessPolicies?.Statement;
      if (statements === undefined || statements.length === 0) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      for (const statement of statements) {
        if (statement.Effect === 'Allow') {
          const allowList = statement?.Condition?.IpAddress?.['aws:sourceIp'];
          if (allowList === undefined || allowList.length === 0) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
    function getPolicyFromCR(): any {
      const crPath =
        node.node.path.split('/Resource').slice(0, -1).join('/Resource') +
        (node instanceof CfnDomain ? '/AccessPolicy' : '/ESAccessPolicy') +
        '/Resource/Default';
      const cr = Stack.of(node)
        .node.findAll()
        .find((c) => c.node.path === crPath);
      if (cr) {
        const props = Stack.of(cr).resolve((<any>cr)._cfnProperties);
        const update = props?.Update?.['Fn::Join']?.[1];
        return JSON.parse(
          JSON.parse(update.join('')).parameters.AccessPolicies
        );
      }
    }
  },
  'name',
  { value: parse(__filename).name }
);
