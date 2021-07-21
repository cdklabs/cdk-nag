import { Annotations, CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack } from '../common';

import {
  nist80053IamGroupMembershipCheck,
  nist80053IamNoInlinePolicyCheck,
  nist80053IamPolicyNoStatementsWithAdminAccess,
  nist80053IamUserNoPoliciesCheck,
}
  from './rules/iam/index';

/**
 * Check whether the cloudformation stack is NIST 800-53 compliant
 * Based on the NIST 800-53 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html
 */
export class NIST80053Checks extends NagPack {
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      // Get ignores metadata if it exists
      const ignores = node.getMetadata('cdk_nag')?.rules_to_suppress;
      this.checkIAMCompliance(node, ignores);
    }
  }

  /**
   * Check IAM Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkIAMCompliance(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMGroupMembershipCheck') &&
          !nist80053IamGroupMembershipCheck(node)
    ) {
      const ruleId = 'NIST.800.53-IAMGroupMembershipCheck';
      const info = 'The IAM user does not belong to any group(s) - (Control IDs: AC-2(1), AC-2(j), AC-3, and AC-6).';
      const explanation =
            'AWS Identity and Access Management (IAM) can help you restrict access permissions and authorizations, by ensuring IAM users are members of at least one group. Allowing users more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMUserNoPoliciesCheck') &&
          !nist80053IamUserNoPoliciesCheck(node)
    ) {
      const ruleId = 'NIST.800.53-IAMUserNoPoliciesCheck';
      const info = 'There is an IAM policy attached at the user level - (Control IDs: AC-2(j), AC-3, AC-5c, AC-6).';
      const explanation =
            'This rule ensures AWS Identity and Access Management (IAM) policies are attached only to groups or roles to control access to systems and assets. Assigning privileges at the group or the role level helps to reduce opportunity for an identity to receive or retain excessive privileges.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMNoInlinePolicyCheck') &&
          !nist80053IamNoInlinePolicyCheck(node)
    ) {
      const ruleId = 'NIST.800.53-IAMNoInlinePolicyCheck';
      const info = 'There is an inline IAM policy - (Control ID: AC-6).';
      const explanation =
            'This check ensures an AWS Identity and Access Management (IAM) user, IAM role or IAM group does not have an inline policy to control access to systems and assets. AWS recommends to use managed policies instead of inline policies. The managed policies allow reusability, versioning and rolling back, and delegating permissions management.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess') &&
          !nist80053IamPolicyNoStatementsWithAdminAccess(node)
    ) {
      const ruleId = 'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess';
      const info = 'There is an IAM policy that gives administrator access - (Control IDs AC-2(1), AC-2(j), AC-3, AC-6).';
      const explanation =
            'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, restricting policies from containing "Effect": "Allow" with "Action": "*" over "Resource": "*". Allowing users to have more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }
}
