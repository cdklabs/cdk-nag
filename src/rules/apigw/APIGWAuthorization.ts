/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { AuthorizationType, CfnMethod } from 'aws-cdk-lib/aws-apigateway';
import { CfnRoute } from 'aws-cdk-lib/aws-apigatewayv2';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

function checkCORSMethodResponses(node: CfnMethod): boolean {
  const methodResponses: CfnMethod.MethodResponseProperty[] = Stack.of(
    node
  ).resolve(node.methodResponses);
  return methodResponses?.every((response) => {
    const hasCORSResponseParameter = Object.entries(
      response.responseParameters || {}
    ).some(
      ([key, value]) =>
        key.startsWith('method.response.header.Access-Control-Allow-') &&
        value === true
    );

    return response.statusCode === '204' && hasCORSResponseParameter;
  });
}

/**
 * APIs implement authorization
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnMethod || node instanceof CfnRoute) {
      if (node instanceof CfnMethod) {
        const httpMethod = NagRules.resolveIfPrimitive(node, node.httpMethod);
        if (httpMethod === 'OPTIONS' && checkCORSMethodResponses(node)) {
          return NagRuleCompliance.COMPLIANT;
        }
      }
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
