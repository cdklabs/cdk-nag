/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { AuthorizationType, CfnMethod } from 'aws-cdk-lib/aws-apigateway';
import { CfnRoute } from 'aws-cdk-lib/aws-apigatewayv2';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * APIs implement authorization
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnMethod || node instanceof CfnRoute) {
      const authorizationType = NagRules.resolveIfPrimitive(
        node,
        node.authorizationType
      );
      if (
        authorizationType == undefined ||
        authorizationType == AuthorizationType.NONE
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
