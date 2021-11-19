/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import {
  CfnSecret,
  CfnRotationSchedule,
  CfnSecretTargetAttachment,
} from 'aws-cdk-lib/aws-secretsmanager';
import { resolveResourceFromInstrinsic } from '../../nag-pack';

/**
 * Secrets have automatic rotation scheduled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnSecret) {
      const secretLogicalId = resolveResourceFromInstrinsic(node, node.ref);
      const secretTargetAttachmentLogicalIds = Array<string>();
      const cfnSecretTargetAttachments = Array<CfnSecretTargetAttachment>();
      const cfnRotationSchedules = Array<CfnRotationSchedule>();
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnSecretTargetAttachment) {
          cfnSecretTargetAttachments.push(child);
        } else if (child instanceof CfnRotationSchedule) {
          cfnRotationSchedules.push(child);
        }
      }
      if (cfnRotationSchedules.length === 0) {
        return false;
      }
      let found = false;
      for (const child of cfnSecretTargetAttachments) {
        const attachmentLogicalId = getMatchingSecretTargetAttachment(
          child,
          secretLogicalId
        );
        if (attachmentLogicalId) {
          secretTargetAttachmentLogicalIds.push(attachmentLogicalId);
        }
      }
      for (const child of cfnRotationSchedules) {
        if (
          isMatchingRotationSchedule(
            child,
            secretLogicalId,
            secretTargetAttachmentLogicalIds
          )
        ) {
          found = true;
          break;
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
 * Helper function to check whether a given Secret Target Attachment is associated with the given secret.
 * @param node The CfnTargetAttachment to check.
 * @param secretLogicalId The Cfn Logical ID of the secret.
 * Returns the Logical ID if the attachment if is associated with the secret, otherwise and empty string.
 */
function getMatchingSecretTargetAttachment(
  node: CfnSecretTargetAttachment,
  secretLogicalId: string
): string {
  const resourceSecretId = resolveResourceFromInstrinsic(node, node.secretId);
  if (secretLogicalId === resourceSecretId) {
    return resolveResourceFromInstrinsic(node, node.ref);
  }
  return '';
}

/**
 * Helper function to check whether a given Rotation Schedule is associated with the given secret.
 * @param node The CfnRotationSchedule to check.
 * @param secretLogicalId The Cfn Logical ID of the secret.
 * @param secretTargetAttachmentLogicalIds The Cfn Logical IDs of any Secret Target Attachments associated with the given secret.
 * Returns whether the CfnRotationSchedule is associated with the given secret.
 */
function isMatchingRotationSchedule(
  node: CfnRotationSchedule,
  secretLogicalId: string,
  secretTargetAttachmentLogicalIds: string[]
): boolean {
  const resourceSecretId = resolveResourceFromInstrinsic(node, node.secretId);
  if (
    secretLogicalId === resourceSecretId ||
    secretTargetAttachmentLogicalIds.includes(resourceSecretId)
  ) {
    if (
      Stack.of(node).resolve(node.hostedRotationLambda) === undefined &&
      Stack.of(node).resolve(node.rotationLambdaArn) === undefined
    ) {
      return false;
    }
    const rotationRules = Stack.of(node).resolve(node.rotationRules);
    if (rotationRules !== undefined) {
      const automaticallyAfterDays = Stack.of(node).resolve(
        rotationRules.automaticallyAfterDays
      );
      if (automaticallyAfterDays !== undefined) {
        return true;
      }
    }
  }
  return false;
}
