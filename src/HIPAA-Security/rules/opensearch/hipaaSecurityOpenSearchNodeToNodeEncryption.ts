/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * OpenSearch Service domains are node-to-node encrypted - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDomain) {
    const encryptedNodeToNode = Stack.of(node).resolve(
      node.nodeToNodeEncryptionOptions
    );
    if (encryptedNodeToNode != undefined) {
      if (
        encryptedNodeToNode.enabled == undefined ||
        encryptedNodeToNode.enabled == false
      ) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}
