/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnSecret, CfnRotationSchedule } from '@aws-cdk/aws-secretsmanager';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../../nag-pack';

/**
 * Secrets have automatic rotation scheduled - (Control IDs: AC-4, AC-4(22), AC-24(1), AU-9(3), CA-9b, PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SI-1a.2, SI-1a.2, SI-1c.2)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnSecret) {
    const secretLogicalId = resolveResourceFromInstrinsic(node, node.ref);
    let found = false;
    for (const child of Stack.of(node).node.findAll()) {
      if (child instanceof CfnRotationSchedule) {
        if (isMatchingRotationSchedule(child, secretLogicalId)) {
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
 * Helper function to check whether a given Rotation Schedule is associated with the given Secret
 * @param node the CfnRotationSchedule to check
 * @param secretLogicalId the Cfn Logical ID of the Secret
 * returns whether the CfnRotationSchedule is associates with the given Secret
 */
function isMatchingRotationSchedule(
  node: CfnRotationSchedule,
  secretLogicalId: string
): boolean {
  const resourceSecretId = resolveResourceFromInstrinsic(node, node.secretId);
  if (secretLogicalId === resourceSecretId) {
    if (Stack.of(node).resolve(node.hostedRotationLambda) !== undefined) {
      return true;
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
