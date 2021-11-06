/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnKey, KeySpec } from '@aws-cdk/aws-kms';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * KMS Symmetric keys have automatic key rotation enabled - (Control IDs: CM-6a, CM-9b, SA-9(6), SC-12, SC-12(2), SC-12(6))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnKey) {
    const keySpec = Stack.of(node).resolve(node.keySpec);
    if (keySpec == undefined || keySpec == KeySpec.SYMMETRIC_DEFAULT) {
      const enableKeyRotation = resolveIfPrimitive(
        node,
        node.enableKeyRotation
      );
      if (enableKeyRotation !== true) {
        return false;
      }
    }
  }
  return true;
}
