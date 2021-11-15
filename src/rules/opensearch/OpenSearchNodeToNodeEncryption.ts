/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * OpenSearch Service domains are node-to-node encrypted
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
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
