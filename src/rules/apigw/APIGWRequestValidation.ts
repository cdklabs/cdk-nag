/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnRequestValidator, CfnRestApi } from 'aws-cdk-lib/aws-apigateway';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Rest APIs have request validation enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnRestApi) {
      const apiLogicalId = NagRules.resolveResourceFromIntrinsic(
        node,
        node.ref
      );
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnRequestValidator) {
          if (isMatchingRequestValidator(child, apiLogicalId)) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
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

/**
 * Check whether a given Request Validator has basic validation enabled and is associated with the given Rest API
 * @param node the CfnRequestValidator to check
 * @param apiLogicalId the Cfn Logical ID of the REST API
 * returns whether the CfnRequestValidator is associated with the given Rest API
 */
function isMatchingRequestValidator(
  node: CfnRequestValidator,
  apiLogicalId: string
): boolean {
  const resourceLogicalId = NagRules.resolveResourceFromIntrinsic(
    node,
    node.restApiId
  );
  return (
    resourceLogicalId === apiLogicalId &&
    Stack.of(node).resolve(node.validateRequestBody) === true &&
    Stack.of(node).resolve(node.validateRequestParameters) === true
  );
}
