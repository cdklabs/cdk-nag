/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { Annotations, CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack } from '../common';

import {
  nist80053EC2CheckDetailedMonitoring,
  nist80053EC2CheckInsideVPC,
  nist80053EC2CheckNoPublicIPs,
  nist80053EC2CheckSSHRestricted,
} from './rules/ec2';
import {
  nist80053_efs_encrypted_check
} from './rules/EFS';

/**
 * Check for NIST 800-53 compliance.
 * Based on the NIST 800-53 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html
 */
export class NIST80053Checks extends NagPack {
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      // Get ignores metadata if it exists
      const ignores = node.getMetadata('cdk_nag')?.rules_to_suppress;
      this.checkCompute(node, ignores);
    }
  }

  /**
   * Check Compute Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkCompute(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckDetailedMonitoring') &&
      !nist80053EC2CheckDetailedMonitoring(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckDetailedMonitoring';
      const info = 'The EC2 instance does not have detailed monitoring enabled - (Control IDs: CA-7(a)(b), SI-4(2), SI-4(a)(b)(c)).';
      const explanation = 'Detailed monitoring provides additional monitoring information (such as 1-minute period graphs) on the AWS console.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckInsideVPC') &&
      !nist80053EC2CheckInsideVPC(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckInsideVPC';
      const info = 'The EC2 instance is not within a VPC - (Control IDs: AC-4, SC-7, SC-7(3)).';
      const explanation = 'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckNoPublicIPs') &&
      !nist80053EC2CheckNoPublicIPs(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckNoPublicIPs';
      const info = 'The EC2 instance is associated with a public IP address - (Control IDs: AC-4, AC-6, AC-21(b), SC-7, SC-7(3)). ';
      const explanation = 'Amazon EC2 instances can contain sensitive information and access control is required for such resources.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckSSHRestricted') &&
      !nist80053EC2CheckSSHRestricted(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckSSHRestricted';
      const info = 'The Security Group allows unrestricted SSH access - (Control IDs: AC-4, SC-7, SC-7(3)).';
      const explanation = 'Not allowing ingress (or remote) traffic from 0.0.0.0/0 or ::/0 to port 22 on your resources helps to restrict remote access.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }

  private checkEFS(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EFSEncryptedCheck') &&
      !nist80053_efs_encrypted_check(node)
    ) {
      const ruleId = 'NIST.800.53-EFSEncryptedCheck';
      const info = 'EFS does not have encryption configured (Control IDs: SC-13, SC-28).';
      const explanation = 'By using an encrypted file system, data and metadata are automatically encrypted before being written to the file system. Similarly, as data and metadata are read, they are automatically decrypted before being presented to the application. These processes are handled transparently by EFS without requiring modification of applications.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }
}
