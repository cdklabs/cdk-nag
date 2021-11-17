/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnGroup, CfnUser, CfnUserToGroupAddition } from '@aws-cdk/aws-iam';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../nag-pack';

/**
 * IAM Groups have at least one IAM User
 * @param node the CfnResource to check
 */

export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnGroup) {
      const groupLogicalId = resolveResourceFromInstrinsic(node, node.ref);
      const groupName = Stack.of(node).resolve(node.groupName);
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnUser) {
          if (isMatchingUser(child, groupLogicalId, groupName)) {
            found = true;
            break;
          }
        } else if (child instanceof CfnUserToGroupAddition) {
          if (isMatchingGroupAddition(child, groupLogicalId, groupName)) {
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
 * Helper function to check whether the IAM User belongs to the IAM Group
 * @param node the CfnUser to check
 * @param groupLogicalId the Cfn Logical ID of the group
 * @param groupName the name of the group
 * returns whether the CfnUser is in the given group
 */
function isMatchingUser(
  node: CfnUser,
  groupLogicalId: string,
  groupName: string | undefined
): boolean {
  const groups = Stack.of(node).resolve(node.groups);
  if (Array.isArray(groups)) {
    for (const group of groups) {
      const resolvedGroup = JSON.stringify(Stack.of(node).resolve(group));
      if (
        new RegExp(`${groupLogicalId}(?![\\w])`).test(resolvedGroup) ||
        (groupName != undefined &&
          new RegExp(`${groupName}(?![\\w\\-_\\.])`).test(resolvedGroup))
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Helper function to check whether the User to Group Addition mentions the specified Group
 * @param node the CfnUserToGroupAddition to check
 * @param groupLogicalId the Cfn Logical ID of the group
 * @param groupName the name of the group
 * returns whether the CfnUserToGroupAddition references the given group
 */
function isMatchingGroupAddition(
  node: CfnUserToGroupAddition,
  groupLogicalId: string,
  groupName: string | undefined
): boolean {
  const resolvedGroup = JSON.stringify(Stack.of(node).resolve(node.groupName));
  if (
    new RegExp(`${groupLogicalId}(?![\\w])`).test(resolvedGroup) ||
    (groupName != undefined &&
      new RegExp(`${groupName}(?![\\w\\-_\\.])`).test(resolvedGroup))
  ) {
    return true;
  }
  return false;
}
