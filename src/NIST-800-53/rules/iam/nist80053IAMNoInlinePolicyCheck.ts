import {
  CfnRole,
  CfnUser,
  CfnGroup,
  CfnPolicy,
} from '@aws-cdk/aws-iam';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * IAM users are assigned to at least one group - (Control ID: AC-6)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (
    node instanceof CfnGroup ||
      node instanceof CfnUser ||
      node instanceof CfnRole
  ) {
    const inlinePolicies = Stack.of(node).resolve(node.policies);
    if (inlinePolicies != undefined) {
      return false;
    }
  }
  if (node instanceof CfnPolicy) {
    return false;
  }
  return true;
}