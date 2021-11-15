/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnWebACL, CfnLoggingConfiguration } from '@aws-cdk/aws-wafv2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../nag-pack';

/**
 * WAFv2 web ACLs have logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnWebACL) {
      const webAclLogicalId = resolveResourceFromInstrinsic(node, node.ref);
      const webAclName = Stack.of(node).resolve(node.name);
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnLoggingConfiguration) {
          if (
            isMatchingLoggingConfiguration(child, webAclLogicalId, webAclName)
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
  },
  'name',
  { value: parse(__filename).name }
);

/**
 * Helper function to check whether the Logging Configuration contains the given Web ACL
 * @param node the CfnLoggingConfiguration to check
 * @param webAclLogicalId the Cfn Logical ID of the Web ACL
 * @param webAclName the name of the Web ACL
 * returns whether the CfnLoggingConfiguration contains the given Web ACL
 */
function isMatchingLoggingConfiguration(
  node: CfnLoggingConfiguration,
  webAclLogicalId: string,
  webAclName: string | undefined
): boolean {
  const resourceArn = JSON.stringify(Stack.of(node).resolve(node.resourceArn));
  if (
    new RegExp(`${webAclLogicalId}(?![\\w])`).test(resourceArn) ||
    (webAclName != undefined &&
      new RegExp(`webacl\/${webAclName}(?![\\w\\-_\\.])`).test(resourceArn))
  ) {
    return true;
  }
  return false;
}
