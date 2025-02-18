/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnStage } from 'aws-cdk-lib/aws-apigateway';
import { CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Rest API stages are associated with AWS WAFv2 web ACLs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnStage) {
      const stageLogicalId = NagRules.resolveResourceFromIntrinsic(
        node,
        node.ref
      );
      const stageName = NagRules.resolveResourceFromIntrinsic(
        node,
        node.stageName
      );
      const restApiId = NagRules.resolveResourceFromIntrinsic(
        node,
        node.restApiId
      );
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnWebACLAssociation) {
          if (
            isMatchingWebACLAssociation(
              child,
              stageLogicalId,
              stageName,
              restApiId
            )
          ) {
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
 * Helper function to check whether a given Web ACL Association is associated with the given Rest API
 * @param node the CfnWebACLAssociation to check
 * @param stageLogicalId the Cfn Logical ID of the REST API Stage
 * @param stageName the name of the REST API Stage
 * @param restApiId the ID or Cfn Resource ID of the REST API associated with the Stage
 * returns whether the CfnWebACLAssociation is associates with the given Rest API
 */
function isMatchingWebACLAssociation(
  node: CfnWebACLAssociation,
  stageLogicalId: string,
  stageName: string | undefined,
  restApiId: string
): boolean {
  const resourceLogicalId = JSON.stringify(
    Stack.of(node).resolve(node.resourceArn)
  );
  const regexes = Array<string>();
  regexes.push(`${restApiId}.+${stageLogicalId}(?![\\w])`);
  if (stageName !== undefined) {
    regexes.push(`${restApiId}.+${stageName}(?![\\w])`);
  }
  const regex = new RegExp(regexes.join('|'), 'gm');
  if (regex.test(resourceLogicalId)) {
    return true;
  }
  return false;
}
