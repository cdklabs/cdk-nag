/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * OpenSearch Service domains are node to node encrypted - (Control IDs: SC-7, SC-8, SC-8(1))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDomain) {
    const encryptedNodeToNode = Stack.of(node).resolve(
      node.nodeToNodeEncryptionOptions
    );
    if (encryptedNodeToNode != undefined) {
      const enabled = resolveIfPrimitive(node, encryptedNodeToNode.enabled);
      if (enabled !== true) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}
