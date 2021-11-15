/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnStage } from '@aws-cdk/aws-apigateway';
import { CfnWebACLAssociation } from '@aws-cdk/aws-wafv2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../nag-pack';

/**
 * Rest API stages are associated with AWS WAFv2 web ACLs
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnStage) {
    const stageLogicalId = resolveResourceFromInstrinsic(node, node.ref);
    const stageName = resolveResourceFromInstrinsic(node, node.stageName);
    const restApiId = resolveResourceFromInstrinsic(node, node.restApiId);
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
      return false;
    }
  }
  return true;
}

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
