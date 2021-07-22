/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Annotations, CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack } from '../common';

import { efs_encrypted_check } from './EFS';
/*import {
  dms_replication_not_public
} from './DMS';*/
/**
 * Check Best practices based on NIST 800-53 Operational Best Practices
 *
 */
export class NIST_80053StorageChecks extends NagPack {
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      // Get ignores metadata if it exists
      const ignores = node.getMetadata('cdk_nag')?.rules_to_suppress;
      this.checkEFS(node, ignores);
    }
  }

  /**
   * Check DMS
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  /*private checkDMS(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'dms_replication_not_public') &&
      !dms_replication_not_public(node)
    ) {
      const ruleId = 'dms_replication_not_public';
      const info = 'The replication instance has public access.';
      const explanation =
        'DMS replication instances can contain sensitive information and access control is required for such accounts.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }*/

   /**
   * Check EFS
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkEFS(node: CfnResource, ignores: any) {
    if (
        !this.ignoreRule(ignores, 'efs_encrypted') &&
        !efs_encrypted_check(node)
      ) {
        const ruleId = 'efs_encrypted_check';
        const info = 'The EFS is not configured for encryption at rest.';
        const explanation =
        'By using an encrypted file system, data and metadata are automatically encrypted before being written to the file system. Similarly, as data and metadata are read, they are automatically decrypted before being presented to the application. These processes are handled transparently by EFS without requiring modification of applications.';
        Annotations.of(node).addError(
          this.createMessage(ruleId, info, explanation),
        );
      }
  }
}
