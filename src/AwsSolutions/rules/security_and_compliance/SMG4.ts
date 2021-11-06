/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnSecret, CfnRotationSchedule } from '@aws-cdk/aws-secretsmanager';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveResourceFromInstrinsic } from '../../../nag-pack';

/**
 * Secrets have automatic rotation scheduled
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
