/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnRequestValidator, CfnRestApi } from 'aws-cdk-lib/aws-apigateway';
import {
  NagRuleCompliance,
  resolveResourceFromInstrinsic,
} from '../../nag-pack';

/**
 * Rest APIs have request validation enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnRestApi) {
      const apiLogicalId = resolveResourceFromInstrinsic(node, node.ref);
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
 * Helper function to check whether a given Request Validator is associated with the given Rest API
 * @param node the CfnRequestValidator to check
 * @param apiLogicalId the Cfn Logical ID of the REST API
 * returns whether the CfnRequestValidator is associated with the given Rest API
 */
function isMatchingRequestValidator(
  node: CfnRequestValidator,
  apiLogicalId: string
): boolean {
  const resourceLogicalId = resolveResourceFromInstrinsic(node, node.restApiId);
  if (resourceLogicalId === apiLogicalId) {
    return true;
  }
  return false;
}
