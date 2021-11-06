/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnWebACL, CfnLoggingConfiguration } from '@aws-cdk/aws-wafv2';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../../nag-pack';

/**
 * WAFv2 web ACLs have logging enabled - (Control IDs: AC-4(26), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-3f, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-8b, AU-10, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), CA-7b, CM-5(1)(b), IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SC-7(9)(b), SI-4(17), SI-7(8))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
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
}

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
