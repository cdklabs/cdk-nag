/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnMethod } from 'aws-cdk-lib/aws-apigateway';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Rest API methods use Cognito User Pool Authorizers
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnMethod) {
      const httpMethod = NagRules.resolveIfPrimitive(node, node.httpMethod);
      if (httpMethod === 'OPTIONS') {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      if (node.authorizationType !== 'COGNITO_USER_POOLS') {
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
