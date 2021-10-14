/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * OpenSearch Service domains have encryption at rest enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDomain) {
    const encryptionAtRestOptions = Stack.of(node).resolve(
      node.encryptionAtRestOptions
    );
    if (encryptionAtRestOptions != undefined) {
      const enabled = resolveIfPrimitive(node, encryptionAtRestOptions.enabled);
      if (enabled !== true) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}
